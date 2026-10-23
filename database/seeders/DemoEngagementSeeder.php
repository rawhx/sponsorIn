<?php

namespace Database\Seeders;

use App\Enums\ProposalStatus;
use App\Enums\ReportStatus;
use App\Enums\ReportTargetType;
use App\Enums\ReviewStatus;
use App\Enums\SponsorshipStatus;
use App\Enums\SponsorVerificationStatus;
use App\Models\Organization;
use App\Models\Proposal;
use App\Models\Report;
use App\Models\Review;
use App\Models\Shortlist;
use App\Models\Sponsorship;
use App\Models\SponsorVerification;
use App\Models\User;
use App\Notifications\NewEventReviewNotification;
use App\Notifications\NewMessageNotification;
use App\Notifications\NewVerificationReviewNotification;
use App\Notifications\ProposalStatusNotification;
use App\Notifications\ReviewPublishedNotification;
use App\Notifications\SponsorshipStatusNotification;
use App\Notifications\VerificationDecisionNotification;
use App\Notifications\VerificationSubmittedNotification;
use App\Services\AuditLogger;
use App\Services\ReviewService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class DemoEngagementSeeder extends Seeder
{
    public function run(): void
    {
        $sponsorships = $this->seedSponsorships();
        $reviews = $this->seedReviews($sponsorships);
        $this->seedShortlists();
        $this->seedNotifications($sponsorships, $reviews);
        $this->seedReports($reviews);
        $this->seedAuditLogs($sponsorships, $reviews);

        $reviewService = app(ReviewService::class);

        foreach ([
            DemoData::organization('eo@sponsorin.test'),
            DemoData::organization('eo.muda@sponsorin.test'),
            DemoData::organization('eo.hidden@sponsorin.test'),
        ] as $organization) {
            $reviewService->recalculate($organization);
        }
    }

    /**
     * @return array<string, Sponsorship>
     */
    private function seedSponsorships(): array
    {
        $created = [];

        foreach ($this->sponsorshipData() as $key => $data) {
            $proposal = DemoProposalsSeeder::proposal($key);
            $sponsor = $this->sponsorOrganization($proposal);
            $eo = $this->eoOrganization($proposal);

            $sponsorship = Sponsorship::create([
                'proposal_id' => $proposal->id,
                'sponsor_org_id' => $sponsor->id,
                'eo_org_id' => $eo->id,
                'event_id' => $proposal->event_id,
                'agreed_terms' => trim($proposal->requested_support."\n\n".($proposal->terms_summary ?? '')),
                'deliverables' => $proposal->deliverables,
                'status' => $data['status'],
                'accepted_at' => $data['accepted_at'],
                'completion_requested_by' => isset($data['requested_by']) ? DemoData::organization($data['requested_by'])->owner_user_id : null,
                'completion_requested_at' => $data['requested_at'] ?? null,
                'completed_at' => $data['completed_at'] ?? null,
                'dispute_reason' => $data['dispute_reason'] ?? null,
            ]);

            $sponsorship->forceFill([
                'created_at' => $data['accepted_at'],
                'updated_at' => $data['updated_at'],
            ])->save();

            $created[$key] = $sponsorship;
        }

        return $created;
    }

    /**
     * @param  array<string, Sponsorship>  $sponsorships
     * @return array<string, Review>
     */
    private function seedReviews(array $sponsorships): array
    {
        $created = [];

        foreach ($this->reviewData() as $key => $data) {
            $sponsorship = $sponsorships[$key];
            $sponsor = $sponsorship->sponsorOrganization;

            $review = Review::create([
                'sponsorship_id' => $sponsorship->id,
                'sponsor_org_id' => $sponsor->id,
                'eo_org_id' => $sponsorship->eo_org_id,
                'overall_rating' => $data['ratings'][0],
                'communication_rating' => $data['ratings'][1],
                'professionalism_rating' => $data['ratings'][2],
                'deliverables_rating' => $data['ratings'][3],
                'comment' => $data['comment'],
                'status' => $data['status'],
                'submitted_at' => $data['submitted_at'],
                'edited_at' => $data['edited_at'] ?? null,
                'published_at' => $data['published_at'] ?? null,
                'hidden_reason' => $data['hidden_reason'] ?? null,
            ]);

            $review->forceFill([
                'created_at' => $data['submitted_at'],
                'updated_at' => $data['hidden_at'] ?? $data['submitted_at'],
            ])->save();

            $created[$key] = $review;
        }

        return $created;
    }

    private function seedShortlists(): void
    {
        $shortlists = [
            ['sponsor@sponsorin.test', 'cicil-kopi-cerita-demo'],
            ['sponsor@sponsorin.test', 'lari-pagi-komunitas-demo'],
            ['sponsor@sponsorin.test', 'pasar-loak-kreatif-demo'],
            ['sponsor.open@sponsorin.test', 'pasar-rakyat-pesisir-demo'],
            ['sponsor.open@sponsorin.test', 'pasar-sehat-warga-demo'],
        ];

        foreach ($shortlists as [$email, $eventSlug]) {
            Shortlist::create([
                'organization_id' => DemoData::organization($email)->id,
                'event_id' => DemoData::event($eventSlug)->id,
            ]);
        }
    }

    /**
     * @param  array<string, Sponsorship>  $sponsorships
     * @param  array<string, Review>  $reviews
     */
    private function seedNotifications(array $sponsorships, array $reviews): void
    {
        $pendingVerification = DemoData::organization('sponsor.pending@sponsorin.test')->verification;
        $reviewVerification = DemoData::organization('sponsor.review@sponsorin.test')->verification;
        $festival = DemoData::event('festival-tari-sekolah-demo');
        $negotiation = DemoProposalsSeeder::proposal('negotiation_s2e');
        $sent = DemoProposalsSeeder::proposal('sent_e2s');
        $active = DemoProposalsSeeder::proposal('active_e2s');
        $publicReview = $reviews['completed_public_review_e2s'];
        $editableReview = $reviews['completed_editable_s2e'];

        $this->notification('admin@sponsorin.test', NewVerificationReviewNotification::class, 'Pengajuan verifikasi baru', 'Ada pengajuan verifikasi sponsor yang menunggu pemeriksaan.', '/admin/verifications/'.$pendingVerification->id, now()->subHours(6));
        $this->notification('admin@sponsorin.test', NewEventReviewNotification::class, 'Event menunggu moderasi', 'Event "'.$festival->title.'" dikirim dan menunggu pemeriksaan.', '/admin/events/'.$festival->id, now()->subDay());
        $this->notification('admin@sponsorin.test', NewVerificationReviewNotification::class, 'Pengajuan verifikasi baru', 'Pengajuan Bank Mitra Desa sudah dibaca dan sedang ditinjau.', '/admin/verifications/'.$reviewVerification->id, now()->subDays(3), true);

        $this->notification('verifier@sponsorin.test', NewVerificationReviewNotification::class, 'Pengajuan verifikasi baru', 'Ada pengajuan verifikasi sponsor yang menunggu pemeriksaan.', '/admin/verifications/'.$pendingVerification->id, now()->subHours(4));
        $this->notification('verifier@sponsorin.test', NewEventReviewNotification::class, 'Event menunggu moderasi', 'Event "'.$festival->title.'" menunggu pemeriksaan.', '/admin/events/'.$festival->id, now()->subDay(), true);

        $this->notification('eo@sponsorin.test', ProposalStatusNotification::class, 'Proposal diterima', 'Event "Pasar Rakyat Pesisir" — status proposal: Diterima.', '/eo/proposals/'.$active->id, now()->subDays(4), true);
        $this->notification('eo@sponsorin.test', ReviewPublishedNotification::class, 'Ulasan baru diterima', 'Sponsor memberi rating 5/5 untuk event "Kelas Fotografi Jalanan".', '/eo/sponsorships/'.$publicReview->sponsorship_id, now()->subDays(5));
        $this->notification('eo@sponsorin.test', NewMessageNotification::class, 'Pesan baru', 'Pesan baru pada proposal untuk event "Pasar Sehat Warga".', '/eo/proposals/'.$negotiation->id, now()->subHours(12));
        $this->notification('eo@sponsorin.test', SponsorshipStatusNotification::class, 'Kerja sama selesai', 'Event "Kelas Fotografi Jalanan" — status kerja sama: Selesai.', '/eo/sponsorships/'.$sponsorships['completed_public_review_e2s']->id, now()->subDays(5), true);

        $this->notification('eo.muda@sponsorin.test', ReviewPublishedNotification::class, 'Ulasan baru diterima', 'Sponsor memberi rating 5/5 untuk event "Cicil Kopi & Cerita".', '/eo/sponsorships/'.$editableReview->sponsorship_id, now()->subHours(2));
        $this->notification('eo.muda@sponsorin.test', SponsorshipStatusNotification::class, 'Kerja sama aktif', 'Event "Cicil Kopi & Cerita" — status kerja sama: Aktif.', '/eo/sponsorships/'.$sponsorships['completed_editable_s2e']->id, now()->subDays(30), true);

        $this->notification('sponsor@sponsorin.test', SponsorshipStatusNotification::class, 'Kerja sama dibatalkan', 'Event "Malam Cerita Pesisir" — status kerja sama: Dibatalkan.', '/sponsor/sponsorships/'.$sponsorships['cancelled_e2s']->id, now()->subDays(12));
        $this->notification('sponsor@sponsorin.test', SponsorshipStatusNotification::class, 'Kerja sama aktif', 'Event "Pasar Rakyat Pesisir" — status kerja sama: Aktif.', '/sponsor/sponsorships/'.$sponsorships['active_e2s']->id, now()->subDays(5), true);

        $this->notification('sponsor.open@sponsorin.test', VerificationDecisionNotification::class, 'Verifikasi disetujui', 'Verifikasi usaha disetujui. Akun sponsor aktif.', '/sponsor/verification', now()->subDays(18), true);
        $this->notification('sponsor.open@sponsorin.test', NewMessageNotification::class, 'Pesan baru', 'Pesan baru pada proposal untuk event "Kelas Fotografi Jalanan".', '/sponsor/proposals/'.$sent->id, now()->subHours(6));
        $this->notification('sponsor.open@sponsorin.test', SponsorshipStatusNotification::class, 'Menunggu konfirmasi', 'Event "Kelas Fotografi Jalanan" — EO meminta penyelesaian kerja sama.', '/sponsor/sponsorships/'.$sponsorships['completion_e2s']->id, now()->subDays(2));

        $this->notification('sponsor.pending@sponsorin.test', VerificationSubmittedNotification::class, 'Pengajuan verifikasi diterima', 'Data usaha Anda sedang menunggu pemeriksaan. Kami akan mengirim kabar setelah proses review selesai.', '/sponsor/verification', now()->subHours(6), true);
        $this->notification('sponsor.needsinfo@sponsorin.test', VerificationDecisionNotification::class, 'Informasi verifikasi perlu dilengkapi', 'Mohon perbarui dokumen pendukung dan alamat usaha sebelum verifikasi dilanjutkan.', '/sponsor/verification', now()->subDays(4));
        $this->notification('sponsor.rejected@sponsorin.test', VerificationDecisionNotification::class, 'Verifikasi belum disetujui', 'Verifikasi belum dapat disetujui karena data usaha pada dokumen tidak sesuai. Silakan perbaiki lalu ajukan kembali.', '/sponsor/verification', now()->subDays(10), true);
        $this->notification('sponsor.suspended@sponsorin.test', VerificationDecisionNotification::class, 'Akses sponsor ditangguhkan', 'Akses sponsor ditangguhkan sementara. Hubungi tim SponsorIn untuk informasi lebih lanjut.', '/sponsor/verification', now()->subDays(38), true);
        $this->notification('blocked@sponsorin.test', VerificationDecisionNotification::class, 'Akun ditangguhkan', 'Akun Anda sedang ditangguhkan. Hubungi tim SponsorIn untuk informasi lebih lanjut.', '/sponsor/verification', now()->subDays(2));
    }

    /**
     * @param  array<string, Review>  $reviews
     */
    private function seedReports(array $reviews): void
    {
        $admin = DemoData::user('admin@sponsorin.test');
        $hiddenEvent = DemoData::event('pasar-loak-kreatif-demo');
        $rejectedEvent = DemoData::event('bazaar-sekolah-demo');

        $reports = [
            [
                'reporter' => 'sponsor.open@sponsorin.test',
                'target_type' => ReportTargetType::Event,
                'target_id' => $hiddenEvent->id,
                'reason' => 'Informasi event tidak lengkap',
                'details' => 'Halaman event tidak mencantumkan narahubung penyelenggara.',
                'status' => ReportStatus::Open,
                'assigned' => null,
                'resolution' => null,
                'resolved_at' => null,
            ],
            [
                'reporter' => 'eo.muda@sponsorin.test',
                'target_type' => ReportTargetType::Account,
                'target_id' => DemoData::user('sponsor.closed@sponsorin.test')->id,
                'reason' => 'Pesan tidak pantas',
                'details' => 'Pesan pada diskusi proposal memuat kalimat yang tidak sesuai etika komunikasi.',
                'status' => ReportStatus::InReview,
                'assigned' => $admin->id,
                'resolution' => null,
                'resolved_at' => null,
            ],
            [
                'reporter' => 'eo@sponsorin.test',
                'target_type' => ReportTargetType::Review,
                'target_id' => $reviews['completed_locked_s2e']->id,
                'reason' => 'Ulasan tidak sesuai fakta',
                'details' => 'Ulasan menyebut deliverable yang sudah kami serahkan sesuai kesepakatan.',
                'status' => ReportStatus::Resolved,
                'assigned' => $admin->id,
                'resolution' => 'Sudah ditinjau bersama kedua pihak. Ulasan tetap tayang dengan catatan klarifikasi.',
                'resolved_at' => now()->subDays(2),
            ],
            [
                'reporter' => 'sponsor@sponsorin.test',
                'target_type' => ReportTargetType::Event,
                'target_id' => $rejectedEvent->id,
                'reason' => 'Event duplikat',
                'details' => 'Event ini tampak sama dengan pengajuan lain dari EO yang sama.',
                'status' => ReportStatus::Dismissed,
                'assigned' => $admin->id,
                'resolution' => 'Tidak ditemukan duplikasi setelah pemeriksaan.',
                'resolved_at' => now()->subDays(4),
            ],
        ];

        foreach ($reports as $data) {
            $report = Report::create([
                'reporter_user_id' => DemoData::user($data['reporter'])->id,
                'target_type' => $data['target_type'],
                'target_id' => $data['target_id'],
                'reason' => $data['reason'],
                'details' => $data['details'],
                'status' => $data['status'],
                'assigned_admin_id' => $data['assigned'],
                'resolution' => $data['resolution'],
                'resolved_at' => $data['resolved_at'],
            ]);

            $report->forceFill([
                'created_at' => $data['resolved_at']?->copy()->subDays(2) ?? now()->subDays(6),
                'updated_at' => $data['resolved_at'] ?? now()->subDays(2),
            ])->save();
        }
    }

    /**
     * @param  array<string, Sponsorship>  $sponsorships
     * @param  array<string, Review>  $reviews
     */
    private function seedAuditLogs(array $sponsorships, array $reviews): void
    {
        $this->seedVerificationAuditLogs();
        $this->seedEventAuditLogs();
        $this->seedProposalAuditLogs();
        $this->seedSponsorshipAuditLogs($sponsorships);
        $this->seedReviewAuditLogs($reviews);
    }

    private function seedVerificationAuditLogs(): void
    {
        $verifications = SponsorVerification::query()
            ->whereIn('organization_id', Organization::query()
                ->whereIn('owner_user_id', User::query()
                    ->whereIn('email', DemoAccountsSeeder::emails())
                    ->pluck('id'))
                ->pluck('id'))
            ->get();

        foreach ($verifications as $verification) {
            $owner = $verification->organization->owner;

            if ($verification->status === SponsorVerificationStatus::Draft) {
                continue;
            }

            if ($verification->submitted_at) {
                $verification->forceFill(['created_at' => $verification->submitted_at])->save();

                $this->audit(
                    'sponsor_verification.submitted',
                    $verification,
                    $owner,
                    ['status' => SponsorVerificationStatus::Draft->value],
                    ['status' => SponsorVerificationStatus::Submitted->value],
                    null,
                    $verification->submitted_at,
                );
            }

            if (! $verification->reviewed_at || $verification->status === SponsorVerificationStatus::Submitted) {
                continue;
            }

            $this->audit(
                'sponsor_verification.'.$verification->status->value,
                $verification,
                $verification->reviewer,
                ['status' => SponsorVerificationStatus::Submitted->value],
                ['status' => $verification->status->value],
                $verification->decision_reason_internal,
                $verification->reviewed_at,
            );
        }
    }

    private function seedEventAuditLogs(): void
    {
        foreach ([
            'pasar-rakyat-pesisir-demo',
            'kelas-fotografi-jalanan-demo',
            'malam-cerita-pesisir-demo',
            'pasar-sehat-warga-demo',
            'cicil-kopi-cerita-demo',
            'lari-pagi-komunitas-demo',
            'pameran-ilustrasi-demo',
            'screening-film-pendek-demo',
            'kelas-lingkungan-demo',
            'pasar-loak-kreatif-demo',
        ] as $slug) {
            $event = DemoData::event($slug);
            $this->audit('event.approved', $event, DemoData::user('verifier@sponsorin.test'), ['status' => 'under_review'], ['status' => 'published'], null, $event->published_at);
        }

        $needsChanges = DemoData::event('pasar-musim-hujan-demo');
        $this->audit('event.needs_changes', $needsChanges, DemoData::user('admin@sponsorin.test'), ['status' => 'under_review'], ['status' => 'needs_changes'], $needsChanges->moderation_reason_internal, now()->subDays(2));

        $rejected = DemoData::event('bazaar-sekolah-demo');
        $this->audit('event.rejected', $rejected, DemoData::user('admin@sponsorin.test'), ['status' => 'under_review'], ['status' => 'rejected'], $rejected->moderation_reason_internal, now()->subDays(5));

        $unpublished = DemoData::event('panggung-puisi-demo');
        $this->audit('event.unpublished', $unpublished, DemoData::user('admin@sponsorin.test'), ['status' => 'published'], ['status' => 'unpublished'], $unpublished->moderation_reason_internal, now()->subDay());

        $underReview = DemoData::event('festival-tari-sekolah-demo');
        $this->audit('event.submitted', $underReview, DemoData::user('eo@sponsorin.test'), ['status' => 'draft'], ['status' => 'under_review'], null, now()->subDays(3));

        $draft = DemoData::event('lokakarya-kriya-demo');
        $this->audit('event.saved', $draft, DemoData::user('eo@sponsorin.test'), [], ['status' => 'draft'], null, now()->subDay());
    }

    private function seedProposalAuditLogs(): void
    {
        foreach (DemoProposalsSeeder::$proposals as $proposal) {
            if ($proposal->status === ProposalStatus::Draft) {
                continue;
            }

            [$actor, $action] = $this->proposalAuditContext($proposal);

            $this->audit(
                $action,
                $proposal,
                $actor,
                ['status' => 'previous'],
                ['status' => $proposal->status->value],
                null,
                $proposal->last_status_at,
            );
        }
    }

    /**
     * @return array{0: ?User, 1: string}
     */
    private function proposalAuditContext(Proposal $proposal): array
    {
        $status = $proposal->status;
        $sender = $proposal->senderOrganization->owner;
        $recipient = $proposal->recipientOrganization->owner;

        return match ($status) {
            ProposalStatus::Sent => [$sender, 'proposal.sent'],
            ProposalStatus::UnderReview => [$recipient, 'proposal.under_review'],
            ProposalStatus::MoreInformationRequested => [$recipient, 'proposal.more_information_requested'],
            ProposalStatus::Negotiation => [$recipient, 'proposal.negotiation'],
            ProposalStatus::Accepted => [$recipient, 'proposal.accepted'],
            ProposalStatus::Rejected => [$recipient, 'proposal.rejected'],
            ProposalStatus::Withdrawn => [$sender, 'proposal.withdrawn'],
            ProposalStatus::Expired => [null, 'proposal.expired'],
            default => [$sender, 'proposal.saved'],
        };
    }

    /**
     * @param  array<string, Sponsorship>  $sponsorships
     */
    private function seedSponsorshipAuditLogs(array $sponsorships): void
    {
        foreach ($sponsorships as $key => $sponsorship) {
            $sponsor = $sponsorship->sponsorOrganization->owner;
            $eo = $sponsorship->eoOrganization->owner;
            $data = $this->sponsorshipData()[$key];

            $this->audit('sponsorship.active', $sponsorship, $sponsor, [], ['status' => SponsorshipStatus::Active->value], null, $data['accepted_at']);

            if (! isset($data['requested_at'])) {
                continue;
            }

            $requestedBy = DemoData::organization($data['requested_by'])->owner;
            $this->audit('sponsorship.completion_requested', $sponsorship, $requestedBy, ['status' => SponsorshipStatus::Active->value], ['status' => SponsorshipStatus::CompletionRequested->value], null, $data['requested_at']);

            if (isset($data['completed_at'])) {
                $confirmer = $requestedBy->is($eo) ? $sponsor : $eo;
                $this->audit('sponsorship.completed', $sponsorship, $confirmer, ['status' => SponsorshipStatus::CompletionRequested->value], ['status' => SponsorshipStatus::Completed->value], null, $data['completed_at']);
            }

            if (isset($data['disputed_at'])) {
                $this->audit('sponsorship.disputed', $sponsorship, $sponsor, ['status' => SponsorshipStatus::CompletionRequested->value], ['status' => SponsorshipStatus::Disputed->value], $data['dispute_reason'] ?? null, $data['disputed_at']);
            }

            if (isset($data['escalated_at'])) {
                $this->audit('sponsorship.needs_admin_review', $sponsorship, null, ['status' => SponsorshipStatus::CompletionRequested->value], ['status' => SponsorshipStatus::NeedsAdminReview->value], 'Tidak ada respons dalam 7 hari kalender.', $data['escalated_at']);
            }
        }
    }

    /**
     * @param  array<string, Review>  $reviews
     */
    private function seedReviewAuditLogs(array $reviews): void
    {
        foreach ($reviews as $key => $review) {
            $data = $this->reviewData()[$key];

            $this->audit('review.published', $review, $review->sponsorOrganization->owner, [], ['sponsorship_id' => $review->sponsorship_id, 'overall_rating' => $review->overall_rating], null, $data['published_at'] ?? $data['submitted_at']);

            if ($review->status === ReviewStatus::Hidden && isset($data['hidden_at'])) {
                $this->audit('review.hidden', $review, DemoData::user('admin@sponsorin.test'), ['status' => ReviewStatus::Published->value], ['status' => ReviewStatus::Hidden->value], $review->hidden_reason, $data['hidden_at']);
            }
        }
    }

    private function notification(string $email, string $type, string $title, string $body, string $url, Carbon $at, bool $read = false): void
    {
        $notification = DemoData::user($email)->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => $type,
            'data' => ['title' => $title, 'body' => $body, 'url' => $url],
            'read_at' => $read ? $at->copy()->addHour() : null,
        ]);

        $notification->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
    }

    private function audit(string $action, Model $entity, ?User $actor, array $before, array $after, ?string $reason, mixed $at): void
    {
        if (! $at) {
            return;
        }

        $log = app(AuditLogger::class)->record($action, $entity, $actor, $before, $after, $reason);
        $log->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
    }

    private function sponsorOrganization(Proposal $proposal): Organization
    {
        return $proposal->senderOrganization->isSponsor()
            ? $proposal->senderOrganization
            : $proposal->recipientOrganization;
    }

    private function eoOrganization(Proposal $proposal): Organization
    {
        return $proposal->senderOrganization->isEo()
            ? $proposal->senderOrganization
            : $proposal->recipientOrganization;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function sponsorshipData(): array
    {
        return [
            'active_e2s' => [
                'status' => SponsorshipStatus::Active,
                'accepted_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            'completion_e2s' => [
                'status' => SponsorshipStatus::CompletionRequested,
                'accepted_at' => now()->subDays(9),
                'requested_by' => 'eo@sponsorin.test',
                'requested_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            'completed_editable_s2e' => [
                'status' => SponsorshipStatus::Completed,
                'accepted_at' => now()->subDays(30),
                'requested_by' => 'eo.muda@sponsorin.test',
                'requested_at' => now()->subDays(3),
                'completed_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ],
            'completed_locked_s2e' => [
                'status' => SponsorshipStatus::Completed,
                'accepted_at' => now()->subDays(60),
                'requested_by' => 'eo.muda@sponsorin.test',
                'requested_at' => now()->subDays(12),
                'completed_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            'completed_no_review_e2s' => [
                'status' => SponsorshipStatus::Completed,
                'accepted_at' => now()->subDays(25),
                'requested_by' => 'eo.muda@sponsorin.test',
                'requested_at' => now()->subDays(4),
                'completed_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            'completed_hidden_s2e' => [
                'status' => SponsorshipStatus::Completed,
                'accepted_at' => now()->subDays(50),
                'requested_by' => 'sponsor.open@sponsorin.test',
                'requested_at' => now()->subDays(22),
                'completed_at' => now()->subDays(20),
                'updated_at' => now()->subDays(20),
            ],
            'disputed_e2s' => [
                'status' => SponsorshipStatus::Disputed,
                'accepted_at' => now()->subDays(18),
                'requested_by' => 'eo.muda@sponsorin.test',
                'requested_at' => now()->subDays(3),
                'dispute_reason' => 'Satu konten kolaborasi belum tayang sesuai jadwal yang disepakati.',
                'disputed_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ],
            'needs_admin_s2e' => [
                'status' => SponsorshipStatus::NeedsAdminReview,
                'accepted_at' => now()->subDays(20),
                'requested_by' => 'sponsor.open@sponsorin.test',
                'requested_at' => now()->subDays(9),
                'escalated_at' => now()->subDays(8),
                'updated_at' => now()->subDays(8),
            ],
            'cancelled_e2s' => [
                'status' => SponsorshipStatus::Cancelled,
                'accepted_at' => now()->subDays(15),
                'cancelled_at' => now()->subDays(12),
                'updated_at' => now()->subDays(12),
            ],
            'completed_public_review_e2s' => [
                'status' => SponsorshipStatus::Completed,
                'accepted_at' => now()->subDays(22),
                'requested_by' => 'eo@sponsorin.test',
                'requested_at' => now()->subDays(7),
                'completed_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function reviewData(): array
    {
        return [
            'completed_editable_s2e' => [
                'ratings' => [5, 5, 5, 4],
                'comment' => 'Koordinasi cepat dan dokumentasi lengkap. Tim EO responsif saat ada perubahan kebutuhan di hari acara.',
                'status' => ReviewStatus::Published,
                'submitted_at' => now()->subHours(2),
                'published_at' => now()->subHours(2),
            ],
            'completed_locked_s2e' => [
                'ratings' => [4, 4, 4, 4],
                'comment' => 'Acara berjalan sesuai rencana. Laporan peserta dan dokumentasi diterima tepat waktu.',
                'status' => ReviewStatus::Published,
                'submitted_at' => now()->subDays(3),
                'published_at' => now()->subDays(3),
            ],
            'completed_hidden_s2e' => [
                'ratings' => [2, 2, 1, 2],
                'comment' => 'Beberapa penempatan logo tidak sesuai kesepakatan dan laporan terlambat dikirim.',
                'status' => ReviewStatus::Hidden,
                'submitted_at' => now()->subDays(16),
                'published_at' => now()->subDays(16),
                'hidden_at' => now()->subDay(),
                'hidden_reason' => 'Ulasan memuat informasi pribadi narahubung yang tidak boleh ditampilkan publik.',
            ],
            'completed_public_review_e2s' => [
                'ratings' => [5, 5, 5, 5],
                'comment' => 'Kerja sama lancar, komunikasi jelas, dan dokumentasi kegiatan rapi. Kami senang bisa mendukung.',
                'status' => ReviewStatus::Published,
                'submitted_at' => now()->subDays(5),
                'published_at' => now()->subDays(5),
            ],
        ];
    }
}
