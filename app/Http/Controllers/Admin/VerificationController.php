<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SponsorVerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SponsorVerification;
use App\Notifications\VerificationDecisionNotification;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(SponsorVerificationStatus::class)],
        ]);

        $query = SponsorVerification::query()
            ->with(['organization.owner', 'reviewer'])
            ->latest('submitted_at')
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $filters['status']);
        }

        $verifications = $query->paginate(15)->withQueryString()->through(fn (SponsorVerification $verification) => [
            'id' => $verification->id,
            'status' => $verification->status->value,
            'organization_name' => $verification->organization->display_name,
            'contact_name' => $verification->organization->owner->name,
            'contact_email' => $verification->organization->owner->email,
            'submitted_at' => $verification->submitted_at?->toISOString(),
            'reviewed_at' => $verification->reviewed_at?->toISOString(),
            'reviewer_name' => $verification->reviewer?->name,
        ]);

        return Inertia::render('admin/Verifications', [
            'verifications' => $verifications,
            'filters' => [
                'status' => $request->string('status')->toString(),
            ],
            'counts' => [
                'submitted' => SponsorVerification::where('status', SponsorVerificationStatus::Submitted)->count(),
                'under_review' => SponsorVerification::where('status', SponsorVerificationStatus::UnderReview)->count(),
                'needs_information' => SponsorVerification::where('status', SponsorVerificationStatus::NeedsInformation)->count(),
                'approved' => SponsorVerification::where('status', SponsorVerificationStatus::Approved)->count(),
                'rejected' => SponsorVerification::where('status', SponsorVerificationStatus::Rejected)->count(),
            ],
        ]);
    }

    public function show(SponsorVerification $verification): Response
    {
        $verification->load(['organization.owner', 'reviewer']);

        return Inertia::render('admin/VerificationDetail', [
            'verification' => [
                'id' => $verification->id,
                'status' => $verification->status->value,
                'organization_name' => $verification->organization->display_name,
                'legal_name' => $verification->organization->legal_name,
                'contact_name' => $verification->organization->owner->name,
                'contact_email' => $verification->organization->owner->email,
                'business_email' => $verification->business_email,
                'legal_form' => $verification->legal_form?->value,
                'nib' => $verification->nib,
                'tax_id' => $verification->tax_id,
                'has_document' => filled($verification->supporting_document_path),
                'submitted_at' => $verification->submitted_at?->toISOString(),
                'reviewed_at' => $verification->reviewed_at?->toISOString(),
                'reviewer_name' => $verification->reviewer?->name,
                'decision_reason_internal' => $verification->decision_reason_internal,
                'decision_reason_public' => $verification->decision_reason_public,
            ],
            'auditLogs' => AuditLog::with('actor')
                ->where('entity_type', SponsorVerification::class)
                ->where('entity_id', $verification->id)
                ->latest()
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'actor' => $log->actor?->name,
                    'reason' => $log->reason,
                    'created_at' => $log->created_at->toISOString(),
                ]),
        ]);
    }

    public function decide(Request $request, SponsorVerification $verification, AuditLogger $audit): RedirectResponse
    {
        $data = $request->validate([
            'decision' => ['required', Rule::in(['approved', 'needs_information', 'rejected'])],
            'reason_internal' => ['nullable', 'string', 'max:2000'],
            'reason_public' => ['required_if:decision,needs_information,rejected', 'nullable', 'string', 'max:1000'],
        ]);

        $before = ['status' => $verification->status->value];

        $status = match ($data['decision']) {
            'approved' => SponsorVerificationStatus::Approved,
            'needs_information' => SponsorVerificationStatus::NeedsInformation,
            'rejected' => SponsorVerificationStatus::Rejected,
        };

        $publicReason = $data['reason_public']
            ?: 'Verifikasi usaha Anda telah disetujui. Akun sponsor kini aktif.';

        $verification->update([
            'status' => $status,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'decision_reason_internal' => $data['reason_internal'] ?? null,
            'decision_reason_public' => $publicReason,
        ]);

        $audit->record(
            'sponsor_verification.'.$data['decision'],
            $verification,
            $request->user(),
            $before,
            ['status' => $status->value],
            $data['reason_internal'] ?? $publicReason,
        );

        $verification->organization->owner->notify(
            new VerificationDecisionNotification($status->value, $publicReason)
        );

        return redirect()
            ->route('admin.verifications.show', $verification)
            ->with('success', 'Keputusan verifikasi berhasil disimpan.');
    }

    public function document(SponsorVerification $verification): StreamedResponse
    {
        abort_unless(filled($verification->supporting_document_path), 404);

        $disk = Storage::disk('local');

        abort_unless($disk->exists($verification->supporting_document_path), 404);

        $extension = pathinfo($verification->supporting_document_path, PATHINFO_EXTENSION);

        return $disk->download(
            $verification->supporting_document_path,
            'dokumen-verifikasi-'.$verification->organization_id.'.'.$extension
        );
    }
}
