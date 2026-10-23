<?php

namespace App\Http\Controllers\EO;

use App\Enums\AudienceEvidenceType;
use App\Enums\EvidenceVerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\AudienceEvidence;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AudienceEvidenceController extends Controller
{
    public function store(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeOwner($request, $event);

        $data = $request->validate([
            'evidence_type' => ['required', 'string'],
            'value' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:40'],
            'period' => ['required', 'string', 'max:120'],
            'source_description' => ['required', 'string', 'max:500'],
            'evidence_note' => ['nullable', 'string', 'max:500'],
        ]);

        $event->audienceEvidence()->create([
            ...$data,
            'evidence_type' => AudienceEvidenceType::from($data['evidence_type']),
            'verification_status' => EvidenceVerificationStatus::Declared,
        ]);

        return back()->with('success', 'Bukti audiens ditambahkan.');
    }

    public function update(Request $request, Event $event, AudienceEvidence $evidence): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($evidence->event_id === $event->id, 404);

        $data = $request->validate([
            'evidence_type' => ['required', 'string'],
            'value' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:40'],
            'period' => ['required', 'string', 'max:120'],
            'source_description' => ['required', 'string', 'max:500'],
            'evidence_note' => ['nullable', 'string', 'max:500'],
        ]);

        $evidence->update([
            ...$data,
            'evidence_type' => AudienceEvidenceType::from($data['evidence_type']),
        ]);

        return back()->with('success', 'Bukti audiens diperbarui.');
    }

    public function destroy(Request $request, Event $event, AudienceEvidence $evidence): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($evidence->event_id === $event->id, 404);

        $evidence->delete();

        return back()->with('success', 'Bukti audiens dihapus.');
    }

    private function authorizeOwner(Request $request, Event $event): void
    {
        abort_unless($event->eo_organization_id === $request->user()->organization?->id, 403);
        abort_unless($event->status->canBeEdited(), 403, 'Event ini sedang dalam proses moderasi.');
    }
}
