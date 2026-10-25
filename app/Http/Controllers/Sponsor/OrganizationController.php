<?php

namespace App\Http\Controllers\Sponsor;

use App\Enums\ProposalPreference;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Profil bisnis sponsor dan preferensi menerima proposal (PRD ORG-01, ORG-02).
 * Data sensitif verifikasi (NIB, NPWP, dokumen) tidak pernah ada di sini.
 */
class OrganizationController extends Controller
{
    public function edit(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        return Inertia::render('sponsor/Organization', [
            'profile' => [
                'display_name' => $organization->display_name,
                'legal_name' => $organization->legal_name,
                'description' => $organization->description,
                'location' => $organization->location,
                'category' => $organization->category,
                'public_contact' => $organization->public_contact,
                'public_visibility' => $organization->public_visibility,
                'proposal_preference' => $organization->proposal_preference->value,
            ],
            'preferences' => [
                ['value' => ProposalPreference::Open->value, 'label' => 'Terbuka', 'hint' => 'EO terverifikasi dapat mengirim proposal kapan saja.'],
                ['value' => ProposalPreference::Selective->value, 'label' => 'Selektif', 'hint' => 'EO tetap dapat mengirim proposal; Anda memilih yang ditanggapi.'],
                ['value' => ProposalPreference::Closed->value, 'label' => 'Tertutup', 'hint' => 'EO tidak dapat mengirim proposal. Anda tetap dapat menghubungi EO.'],
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $data = $request->validate([
            'display_name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'location' => ['nullable', 'string', 'max:160'],
            'category' => ['nullable', 'string', 'max:80'],
            'public_contact' => ['nullable', 'string', 'max:255'],
            'public_visibility' => ['required', 'boolean'],
            'proposal_preference' => ['required', Rule::enum(ProposalPreference::class)],
        ]);

        // Nama legal berasal dari dokumen verifikasi dan tidak dapat diubah dari sini.
        $organization->update($data);

        return back()->with('success', 'Profil dan preferensi sponsor diperbarui.');
    }
}
