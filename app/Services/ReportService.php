<?php

namespace App\Services;

use App\Enums\AccountStatus;
use App\Enums\EventStatus;
use App\Enums\ReportStatus;
use App\Enums\ReportTargetType;
use App\Enums\ReviewStatus;
use App\Models\Event;
use App\Models\Report;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Pelaporan penyalahgunaan (PRD ADM-02): pengguna melaporkan event, akun, atau ulasan;
 * admin meninjau, memberi tindakan, dan mencatat hasil.
 */
class ReportService
{
    /** Alasan yang dapat dipilih pelapor (divalidasi di server). */
    public const REASONS = [
        'misleading_info' => 'Informasi menyesatkan atau tidak benar',
        'incomplete_info' => 'Informasi tidak lengkap',
        'spam' => 'Spam atau promosi tidak relevan',
        'inappropriate_content' => 'Konten tidak pantas atau ujaran kebencian',
        'impersonation' => 'Menyamar sebagai pihak lain',
        'suspected_fraud' => 'Dugaan penipuan',
        'review_inaccurate' => 'Ulasan tidak sesuai fakta',
        'review_data_error' => 'Ulasan memuat kesalahan data (koreksi)',
        'other' => 'Lainnya',
    ];

    /** Alasan yang berlaku untuk tiap jenis target. */
    public const REASONS_BY_TARGET = [
        'event' => ['misleading_info', 'incomplete_info', 'spam', 'inappropriate_content', 'suspected_fraud', 'other'],
        'review' => ['review_inaccurate', 'review_data_error', 'inappropriate_content', 'spam', 'other'],
        'account' => ['impersonation', 'spam', 'inappropriate_content', 'suspected_fraud', 'other'],
    ];

    public function __construct(private AuditLogger $audit) {}

    /**
     * Daftar alasan per jenis target dalam bentuk siap pakai untuk UI.
     *
     * @return array<string, array<int, array{value: string, label: string}>>
     */
    public static function reasonOptions(): array
    {
        return collect(self::REASONS_BY_TARGET)->map(
            fn (array $keys) => collect($keys)->map(fn (string $key) => ['value' => $key, 'label' => self::REASONS[$key]])->values()->all()
        )->all();
    }

    /**
     * Buat laporan. Untuk target "account", $targetId adalah ID organisasi (dipetakan ke pemilik akun)
     * atau ID user; hasilnya selalu disimpan sebagai ID user agar konsisten.
     */
    public function create(User $reporter, ReportTargetType $type, int $targetId, string $reason, ?string $details): Report
    {
        if (! in_array($reason, self::REASONS_BY_TARGET[$type->value], true)) {
            throw ValidationException::withMessages(['reason' => 'Alasan tidak sesuai dengan jenis laporan.']);
        }

        $targetId = $this->authorizeAndResolveTarget($reporter, $type, $targetId);

        $duplicate = Report::query()
            ->where('reporter_user_id', $reporter->id)
            ->where('target_type', $type)
            ->where('target_id', $targetId)
            ->whereIn('status', [ReportStatus::Open, ReportStatus::InReview])
            ->exists();

        if ($duplicate) {
            throw ValidationException::withMessages([
                'reason' => 'Anda sudah melaporkan hal ini dan laporan masih ditinjau admin.',
            ]);
        }

        return DB::transaction(function () use ($reporter, $type, $targetId, $reason, $details) {
            $report = Report::create([
                'reporter_user_id' => $reporter->id,
                'target_type' => $type,
                'target_id' => $targetId,
                'reason' => self::REASONS[$reason],
                'details' => $details,
                'status' => ReportStatus::Open,
            ]);

            $this->audit->record('report.created', $report, $reporter, [], [
                'target_type' => $type->value,
                'target_id' => $targetId,
            ]);

            return $report;
        });
    }

    /**
     * Tindak lanjut admin. Status akhir (resolved/dismissed) wajib disertai catatan hasil.
     */
    public function review(Report $report, User $admin, ReportStatus $to, ?string $resolution, bool $suspendAccount = false): Report
    {
        abort_unless($admin->isStaff(), 403);

        $allowed = match ($report->status) {
            ReportStatus::Open => [ReportStatus::InReview, ReportStatus::Resolved, ReportStatus::Dismissed],
            ReportStatus::InReview => [ReportStatus::Resolved, ReportStatus::Dismissed],
            default => [],
        };

        if (! in_array($to, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => 'Laporan ini tidak dapat diubah ke status tersebut.',
            ]);
        }

        $isFinal = in_array($to, [ReportStatus::Resolved, ReportStatus::Dismissed], true);

        if ($isFinal && blank($resolution)) {
            throw ValidationException::withMessages([
                'resolution' => 'Catatan hasil wajib diisi untuk menutup laporan.',
            ]);
        }

        return DB::transaction(function () use ($report, $admin, $to, $resolution, $suspendAccount, $isFinal) {
            $before = ['status' => $report->status->value];

            $report->update([
                'status' => $to,
                'assigned_admin_id' => $report->assigned_admin_id ?? $admin->id,
                'resolution' => $isFinal ? $resolution : $report->resolution,
                'resolved_at' => $isFinal ? now() : null,
            ]);

            $this->audit->record('report.'.$to->value, $report, $admin, $before, [
                'status' => $to->value,
                'target_type' => $report->target_type->value,
                'target_id' => $report->target_id,
            ], $resolution);

            if ($suspendAccount && $to === ReportStatus::Resolved) {
                $this->suspendAccount($report, $admin, (string) $resolution);
            }

            return $report;
        });
    }

    /**
     * Ringkasan target laporan untuk ditampilkan ke admin (tanpa data sensitif verifikasi).
     *
     * @return array<string, mixed>|null
     */
    public function describeTarget(Report $report): ?array
    {
        return match ($report->target_type) {
            ReportTargetType::Event => ($event = Event::with('eoOrganization')->find($report->target_id)) ? [
                'kind' => 'Event',
                'title' => $event->title,
                'subtitle' => 'Penyelenggara: '.$event->eoOrganization->display_name.' · Status: '.$event->status->value,
                'url' => route('admin.events.show', $event),
                'action_label' => 'Buka moderasi event',
            ] : null,
            ReportTargetType::Review => ($review = Review::with(['sponsorship.event', 'sponsorship.eoOrganization', 'sponsorship.sponsorOrganization'])->find($report->target_id)) ? [
                'kind' => 'Ulasan',
                'title' => $review->sponsorship->event->title,
                'subtitle' => 'Sponsor: '.$review->sponsorship->sponsorOrganization->display_name
                    .' → EO: '.$review->sponsorship->eoOrganization->display_name
                    .' · Rating '.$review->overall_rating.'/5 · Status: '.$review->status->value,
                'excerpt' => $review->comment,
                'url' => route('admin.reviews.index', ['q' => $review->sponsorship->event->title]),
                'action_label' => 'Buka moderasi ulasan',
            ] : null,
            ReportTargetType::Account => ($user = User::with('organization')->find($report->target_id)) ? [
                'kind' => 'Akun',
                'title' => $user->organization?->display_name ?? $user->name,
                'subtitle' => $user->name.' · Peran: '.$user->role->value.' · Status akun: '.$user->account_status->value,
                'url' => null,
                'action_label' => null,
                'is_suspended' => $user->account_status === AccountStatus::Suspended,
                'can_suspend' => ! $user->isStaff() && $user->account_status === AccountStatus::Active,
            ] : null,
        };
    }

    private function authorizeAndResolveTarget(User $reporter, ReportTargetType $type, int $targetId): int
    {
        $organization = $reporter->organization;

        switch ($type) {
            case ReportTargetType::Event:
                $event = Event::find($targetId);
                abort_unless($event && $event->status === EventStatus::Published, 404);
                abort_if($organization && $event->eo_organization_id === $organization->id, 403, 'Anda tidak dapat melaporkan event milik sendiri.');

                return $event->id;

            case ReportTargetType::Review:
                $review = Review::find($targetId);
                abort_unless($review && $review->status === ReviewStatus::Published, 404);
                // Hanya pihak yang terlibat (EO yang diulas atau sponsor penulis) yang dapat melaporkan.
                abort_unless(
                    $organization && in_array($organization->id, [$review->eo_org_id, $review->sponsor_org_id], true),
                    403,
                    'Hanya pihak yang terlibat pada kerja sama ini yang dapat melaporkan ulasan.'
                );

                return $review->id;

            case ReportTargetType::Account:
                // Menerima ID organisasi (dari halaman publik) atau ID user.
                $user = \App\Models\Organization::find($targetId)?->owner ?? User::find($targetId);
                abort_unless($user, 404);
                abort_if($user->id === $reporter->id, 403, 'Anda tidak dapat melaporkan akun sendiri.');
                abort_if($user->isStaff(), 403, 'Akun ini tidak dapat dilaporkan.');

                return $user->id;
        }
    }

    private function suspendAccount(Report $report, User $admin, string $reason): void
    {
        abort_unless($report->target_type === ReportTargetType::Account, 422, 'Hanya laporan akun yang dapat menangguhkan akun.');

        $user = User::findOrFail($report->target_id);
        abort_if($user->isStaff(), 403);

        if ($user->account_status === AccountStatus::Suspended) {
            return;
        }

        $user->forceFill(['account_status' => AccountStatus::Suspended])->save();

        $this->audit->record('account.suspended', $user, $admin, [
            'account_status' => AccountStatus::Active->value,
        ], [
            'account_status' => AccountStatus::Suspended->value,
            'report_id' => $report->id,
        ], $reason);
    }
}
