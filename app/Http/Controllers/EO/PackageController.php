<?php

namespace App\Http\Controllers\EO;

use App\Enums\PackageAvailability;
use App\Enums\SupportType;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\SponsorshipPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function store(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeOwner($request, $event);

        $event->packages()->create($this->validated($request));

        return back()->with('success', 'Paket sponsorship ditambahkan.');
    }

    public function update(Request $request, Event $event, SponsorshipPackage $package): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($package->event_id === $event->id, 404);

        $package->update($this->validated($request));

        return back()->with('success', 'Paket sponsorship diperbarui.');
    }

    public function destroy(Request $request, Event $event, SponsorshipPackage $package): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($package->event_id === $event->id, 404);

        $package->delete();

        return back()->with('success', 'Paket sponsorship dihapus.');
    }

    private function authorizeOwner(Request $request, Event $event): void
    {
        abort_unless($event->eo_organization_id === $request->user()->organization?->id, 403);
        abort_unless($event->status->canBeEdited(), 403, 'Event ini sedang dalam proses moderasi.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'support_type' => ['required', 'string'],
            'price_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'benefits' => ['nullable', 'array'],
            'benefits.*' => ['string', 'max:300'],
            'deliverables' => ['nullable', 'array'],
            'deliverables.*' => ['string', 'max:300'],
            'availability_status' => ['required', 'string'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        return [
            'name' => $data['name'],
            'support_type' => SupportType::from($data['support_type']),
            'price_amount' => $data['price_amount'] ?? null,
            'currency' => $data['currency'] ?? 'IDR',
            'benefits' => array_values(array_filter($data['benefits'] ?? [])),
            'deliverables' => array_values(array_filter($data['deliverables'] ?? [])),
            'availability_status' => PackageAvailability::from($data['availability_status']),
            'notes' => $data['notes'] ?? null,
        ];
    }
}
