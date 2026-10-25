<?php

namespace App\Http\Controllers\EO;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Profil publik EO (PRD EO-01): nama, deskripsi, lokasi, kategori, kontak publik, portofolio.
 */
class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        return Inertia::render('eo/Profile', [
            'profile' => [
                'id' => $organization->id,
                'display_name' => $organization->display_name,
                'description' => $organization->description,
                'portfolio' => $organization->portfolio,
                'location' => $organization->location,
                'category' => $organization->category,
                'public_contact' => $organization->public_contact,
                'public_visibility' => $organization->public_visibility,
                'rating_average' => $organization->rating_average,
                'review_count' => $organization->review_count,
                'published_event_count' => $organization->events()->where('status', 'published')->count(),
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
            'portfolio' => ['nullable', 'string', 'max:3000'],
            'location' => ['nullable', 'string', 'max:160'],
            'category' => ['nullable', 'string', 'max:80'],
            'public_contact' => ['nullable', 'string', 'max:255'],
            'public_visibility' => ['required', 'boolean'],
        ]);

        $organization->update($data);

        return back()->with('success', 'Profil penyelenggara diperbarui.');
    }
}
