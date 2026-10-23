<?php

namespace App\Http\Controllers\Sponsor;

use App\Enums\BusinessLegalForm;
use App\Enums\SponsorVerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\NewVerificationReviewNotification;
use App\Notifications\VerificationSubmittedNotification;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SponsorVerificationController extends Controller
{
    public function show(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $verification = $organization->verification;
        abort_unless($verification, 404);

        return Inertia::render('sponsor/Verification', [
            'verification' => [
                'status' => $verification->status->value,
                'business_name' => $organization->legal_name,
                'business_email' => $verification->business_email,
                'legal_form' => $verification->legal_form?->value,
                'nib_masked' => $this->mask($verification->nib),
                'tax_id_masked' => $this->mask($verification->tax_id),
                'has_nib' => filled($verification->nib),
                'has_tax_id' => filled($verification->tax_id),
                'has_document' => filled($verification->supporting_document_path),
                'submitted_at' => $verification->submitted_at?->toISOString(),
                'reviewed_at' => $verification->reviewed_at?->toISOString(),
                'decision_reason_public' => $verification->decision_reason_public,
            ],
            'legalForms' => collect(BusinessLegalForm::cases())->map(fn ($form) => [
                'value' => $form->value,
                'label' => match ($form) {
                    BusinessLegalForm::Pt => 'PT',
                    BusinessLegalForm::Cv => 'CV',
                    BusinessLegalForm::Firma => 'Firma',
                    BusinessLegalForm::Koperasi => 'Koperasi',
                    BusinessLegalForm::Yayasan => 'Yayasan',
                    BusinessLegalForm::Perorangan => 'Usaha perorangan',
                    BusinessLegalForm::Lainnya => 'Lainnya',
                },
            ])->values(),
            'editable' => in_array($verification->status, [
                SponsorVerificationStatus::Draft,
                SponsorVerificationStatus::NeedsInformation,
                SponsorVerificationStatus::Rejected,
            ], true),
        ]);
    }

    public function update(Request $request, AuditLogger $audit): RedirectResponse
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $verification = $organization->verification;
        abort_unless($verification, 404);

        if (! in_array($verification->status, [
            SponsorVerificationStatus::Draft,
            SponsorVerificationStatus::NeedsInformation,
            SponsorVerificationStatus::Rejected,
        ], true)) {
            return back()->with('error', 'Pengajuan ini sedang diproses dan belum dapat diubah.');
        }

        $submit = $request->boolean('submit');

        $request->merge([
            'business_email' => $request->filled('business_email')
                ? Str::lower(trim((string) $request->input('business_email')))
                : null,
            'legal_form' => $request->input('legal_form') ?: null,
            'nib' => $request->input('nib') ?: null,
            'tax_id' => $request->input('tax_id') ?: null,
        ]);

        $data = $request->validate([
            'business_name' => [$submit ? 'required' : 'nullable', 'string', 'max:160'],
            'business_email' => [$submit ? 'required' : 'nullable', 'email', 'max:255'],
            'legal_form' => [$submit ? 'required' : 'nullable', Rule::enum(BusinessLegalForm::class)],
            'nib' => [$submit && ! filled($verification->nib) ? 'required' : 'nullable', 'string', 'max:32'],
            'tax_id' => [$submit && ! filled($verification->tax_id) ? 'required' : 'nullable', 'string', 'max:32'],
            'supporting_document' => [
                $submit && ! $verification->supporting_document_path ? 'required' : 'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120',
            ],
        ]);

        if ($submit && (! ($data['business_name'] ?? null) || ! ($data['business_email'] ?? null) || ! ($data['legal_form'] ?? null))) {
            return back()->withErrors([
                'business_name' => 'Lengkapi seluruh data usaha sebelum mengirim pengajuan.',
            ])->withInput();
        }

        $before = ['status' => $verification->status->value];

        DB::transaction(function () use ($request, $verification, $organization, $data, $submit, $audit, $before) {
            if ($request->hasFile('supporting_document')) {
                if ($verification->supporting_document_path) {
                    Storage::disk('local')->delete($verification->supporting_document_path);
                }

                $path = $request->file('supporting_document')->store(
                    'verification-documents/'.$organization->id,
                    'local'
                );

                $verification->supporting_document_path = $path;
            }

            if ($data['business_name'] ?? null) {
                $organization->update([
                    'legal_name' => $data['business_name'],
                    'display_name' => $data['business_name'],
                ]);
            }

            $verification->business_email = $data['business_email'] ?? $verification->business_email;
            $verification->legal_form = $data['legal_form'] ?? $verification->legal_form;
            $verification->nib = $data['nib'] ?? $verification->nib;
            $verification->tax_id = $data['tax_id'] ?? $verification->tax_id;

            if ($submit) {
                $verification->status = SponsorVerificationStatus::Submitted;
                $verification->submitted_at = now();
                $verification->reviewed_by = null;
                $verification->reviewed_at = null;
                $verification->decision_reason_internal = null;
                $verification->decision_reason_public = null;
            }

            $verification->save();

            $audit->record(
                $submit ? 'sponsor_verification.submitted' : 'sponsor_verification.saved',
                $verification,
                $request->user(),
                $before,
                ['status' => $verification->status->value],
            );

            if ($submit) {
                $request->user()->notify(new VerificationSubmittedNotification);

                $staff = User::query()
                    ->whereIn('role', ['admin', 'verifier'])
                    ->where('account_status', 'active')
                    ->get();

                Notification::send($staff, new NewVerificationReviewNotification($verification));
            }
        });

        return back()->with(
            'success',
            $submit
                ? 'Pengajuan verifikasi telah dikirim. Kami akan mengirim kabar setelah review selesai.'
                : 'Data verifikasi berhasil disimpan sebagai draft.'
        );
    }

    private function mask(?string $value): ?string
    {
        if (! filled($value)) {
            return null;
        }

        $visible = substr($value, -4);

        return str_repeat('•', max(4, strlen($value) - 4)).$visible;
    }
}
