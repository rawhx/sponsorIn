<?php

namespace App\Http\Controllers\Sponsor;

use App\Enums\BusinessLegalForm;
use App\Enums\ProposalPreference;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function index(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization && $organization->isSponsor(), 404);

        return Inertia::render('sponsor/Organizations', [
            'organization' => [
                'id' => $organization->id,
                'legal_name' => $organization->legal_name,
                'display_name' => $organization->display_name,
                'description' => $organization->description,
                'category' => $organization->category,
                'location' => $organization->location,
                'public_contact' => $organization->public_contact,
                'public_visibility' => $organization->public_visibility,
                'proposal_preference' => $organization->proposal_preference->value,
                'rating_average' => $organization->rating_average,
                'review_count' => $organization->review_count,
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
            'preferences' => collect(ProposalPreference::cases())->map(fn ($pref) => [
                'value' => $pref->value,
                'label' => $pref->value === 'open' ? 'Menerima proposal' : ($pref->value === 'selective' ? 'Selektif' : 'Tertutup'),
            ])->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $organization = $request->user()->organization;
        abort_unless($organization && $organization->isSponsor(), 404);

        $data = $request->validate([
            'legal_name' => ['required', 'string', 'max:160'],
            'display_name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'category' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:120'],
            'public_contact' => ['nullable', 'string', 'email', 'max:255'],
            'public_visibility' => ['nullable', 'boolean'],
            'proposal_preference' => ['required', Rule::enum(ProposalPreference::class)],
        ]);

        $organization->update([
            'legal_name' => $data['legal_name'],
            'display_name' => $data['display_name'],
            'description' => $data['description'] ?? $organization->description,
            'category' => $data['category'] ?? $organization->category,
            'location' => $data['location'] ?? $organization->location,
            'public_contact' => $data['public_contact'] ?? $organization->public_contact,
            'public_visibility' => $data['public_visibility'] ?? $organization->public_visibility,
            'proposal_preference' => $data['proposal_preference'],
        ]);

        return back()->with('success', 'Profil sponsor berhasil diperbarui.');
    }
}
