<?php

namespace App\Http\Controllers\PublicSite;

use App\Enums\EventStatus;
use App\Enums\OrganizationType;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizerController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:120'],
        ]);

        $organizers = Organization::query()
            ->where('type', OrganizationType::Eo)
            ->where('public_visibility', true)
            ->whereHas('events', fn ($query) => $query->where('status', EventStatus::Published))
            ->when($filters['q'] ?? null, fn ($query, $q) => $query->where(function ($query) use ($q) {
                $query->where('display_name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            }))
            ->when($filters['location'] ?? null, fn ($query, $location) => $query->where('location', 'like', "%{$location}%"))
            ->withCount(['events' => fn ($query) => $query->where('status', EventStatus::Published)])
            ->orderByDesc('events_count')
            ->orderBy('display_name')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Organization $organization) => [
                'id' => $organization->id,
                'name' => $organization->display_name,
                'description' => $organization->description,
                'location' => $organization->location,
                'rating_average' => $organization->rating_average,
                'review_count' => $organization->review_count,
                'event_count' => $organization->events_count,
                'verified' => $organization->verification?->status->value === 'approved',
            ]);

        return Inertia::render('public/Organizers', [
            'organizers' => $organizers,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'location' => $request->string('location')->toString(),
            ],
        ]);
    }

    public function show(Organization $organization): Response
    {
        abort_unless($organization->type === OrganizationType::Eo, 404);

        $events = $organization->events()
            ->where('status', EventStatus::Published)
            ->with(['audienceEvidence', 'packages'])
            ->orderBy('date_start')
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'slug' => $event->slug,
                'title' => $event->title,
                'category' => $event->category,
                'date_start' => $event->date_start->toDateString(),
                'date_end' => $event->date_end?->toDateString(),
                'location' => $event->location,
                'audience_summary' => $event->audience_profile,
                'evidence_count' => $event->audienceEvidence->count(),
                'package_count' => $event->packages->count(),
            ]);

        abort_if($events->isEmpty(), 404);

        return Inertia::render('public/OrganizerShow', [
            'organizer' => [
                'id' => $organization->id,
                'name' => $organization->display_name,
                'description' => $organization->description,
                'location' => $organization->location,
                'category' => $organization->category,
                'public_contact' => $organization->public_contact,
                'rating_average' => $organization->rating_average,
                'review_count' => $organization->review_count,
                'verified' => $organization->verification?->status->value === 'approved',
                'event_count' => $events->count(),
            ],
            'events' => $events,
        ]);
    }
}
