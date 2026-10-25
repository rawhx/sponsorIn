<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Notifications\EventModerationDecisionNotification;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EventModerationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(EventStatus::class)],
        ]);

        $query = Event::query()
            ->with('eoOrganization')
            ->latest('updated_at');

        if ($request->filled('status')) {
            $query->where('status', $filters['status']);
        }

        $events = $query->paginate(15)->withQueryString()->through(fn (Event $event) => [
            'id' => $event->id,
            'title' => $event->title,
            'organizer' => $event->eoOrganization->display_name,
            'category' => $event->category,
            'location' => $event->location,
            'date_start' => $event->date_start->toDateString(),
            'status' => $event->status->value,
            'updated_at' => $event->updated_at->toISOString(),
        ]);

        return Inertia::render('admin/Events', [
            'events' => $events,
            'filters' => ['status' => $request->string('status')->toString()],
            'counts' => [
                'under_review' => Event::where('status', EventStatus::UnderReview)->count(),
                'published' => Event::where('status', EventStatus::Published)->count(),
                'needs_changes' => Event::where('status', EventStatus::NeedsChanges)->count(),
                'rejected' => Event::where('status', EventStatus::Rejected)->count(),
                'unpublished' => Event::where('status', EventStatus::Unpublished)->count(),
            ],
        ]);
    }

    public function show(Event $event): Response
    {
        $event->load(['eoOrganization.verification', 'audienceEvidence', 'packages']);

        return Inertia::render('admin/EventDetail', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'category' => $event->category,
                'format' => $event->format,
                'date_start' => $event->date_start->toDateString(),
                'date_end' => $event->date_end?->toDateString(),
                'location' => $event->location,
                'description' => $event->description,
                'audience_profile' => $event->audience_profile,
                'capacity_estimate' => $event->capacity_estimate,
                'support_needs' => $event->support_needs,
                'status' => $event->status->value,
                'moderation_reason_internal' => $event->moderation_reason_internal,
                'moderation_reason_public' => $event->moderation_reason_public,
                'allowed_decisions' => collect($event->status->allowedModerationDecisions())
                    ->map(fn (EventStatus $status) => match ($status) {
                        EventStatus::Published => 'approved',
                        default => $status->value,
                    })
                    ->values()
                    ->all(),
                'organizer' => [
                    'name' => $event->eoOrganization->display_name,
                    'verified' => $event->eoOrganization->verification?->status->value === 'approved',
                ],
                'evidence' => $event->audienceEvidence->map(fn ($evidence) => [
                    'id' => $evidence->id,
                    'type' => $evidence->evidence_type->value,
                    'value' => $evidence->value,
                    'unit' => $evidence->unit,
                    'period' => $evidence->period,
                    'source' => $evidence->source_description,
                    'note' => $evidence->evidence_note,
                    'verification_status' => $evidence->verification_status->value,
                ]),
                'packages' => $event->packages->map(fn ($package) => [
                    'id' => $package->id,
                    'name' => $package->name,
                    'support_type' => $package->support_type->value,
                    'price_amount' => $package->price_amount,
                    'currency' => $package->currency,
                    'benefits' => $package->benefits,
                    'deliverables' => $package->deliverables,
                    'availability_status' => $package->availability_status->value,
                ]),
            ],
        ]);
    }

    public function decide(Request $request, Event $event, AuditLogger $audit): RedirectResponse
    {
        $data = $request->validate([
            'decision' => ['required', Rule::in(['approved', 'needs_changes', 'rejected', 'unpublished'])],
            'reason_internal' => ['nullable', 'string', 'max:2000'],
            'reason_public' => ['required_if:decision,needs_changes,rejected,unpublished', 'nullable', 'string', 'max:1000'],
        ]);

        $status = match ($data['decision']) {
            'approved' => EventStatus::Published,
            'needs_changes' => EventStatus::NeedsChanges,
            'rejected' => EventStatus::Rejected,
            'unpublished' => EventStatus::Unpublished,
        };

        // Transisi moderasi divalidasi di server (PRD 9.1): mis. event Draft tidak bisa langsung terbit.
        if (! $event->status->canBeModeratedTo($status)) {
            throw ValidationException::withMessages([
                'decision' => 'Keputusan ini tidak dapat diambil untuk event berstatus "'.$event->status->value.'".',
            ]);
        }

        $before = ['status' => $event->status->value];

        $event->update([
            'status' => $status,
            'published_at' => $status === EventStatus::Published ? ($event->published_at ?? now()) : $event->published_at,
            'moderation_reason_internal' => $data['reason_internal'] ?? null,
            'moderation_reason_public' => $data['reason_public'] ?? null,
        ]);

        $audit->record(
            'event.'.$data['decision'],
            $event,
            $request->user(),
            $before,
            ['status' => $status->value],
            $data['reason_internal'] ?? $data['reason_public'] ?? null,
        );

        $event->eoOrganization->owner->notify(
            new EventModerationDecisionNotification(
                $event->title,
                $event->id,
                $status->value,
                $data['reason_public'] ?? null,
            )
        );

        return redirect()
            ->route('admin.events.show', $event)
            ->with('success', 'Keputusan moderasi event disimpan.');
    }
}
