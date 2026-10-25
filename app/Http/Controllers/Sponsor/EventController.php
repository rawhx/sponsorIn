<?php

namespace App\Http\Controllers\Sponsor;

use App\Enums\EventStatus;
use App\Enums\SupportType;
use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:80'],
            'location' => ['nullable', 'string', 'max:120'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'support_type' => ['nullable', 'string', 'max:40'],
        ]);

        $events = Event::published()
            ->with(['eoOrganization', 'audienceEvidence', 'packages'])
            ->when($filters['q'] ?? null, fn ($query, $q) => $query->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('location', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            }))
            ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('category', $category))
            ->when($filters['location'] ?? null, fn ($query, $location) => $query->where('location', 'like', "%{$location}%"))
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('date_start', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('date_start', '<=', $date))
            ->when($filters['support_type'] ?? null, fn ($query, $supportType) => $query->whereHas(
                'packages',
                fn ($query) => $query->where('support_type', $supportType)
            ))
            ->orderBy('date_start')
            ->paginate(9)
            ->withQueryString()
            ->through(fn (Event $event) => [
                'id' => $event->id,
                'slug' => $event->slug,
                'title' => $event->title,
                'category' => $event->category,
                'date_start' => $event->date_start->toDateString(),
                'date_end' => $event->date_end?->toDateString(),
                'location' => $event->location,
                'organizer' => $event->eoOrganization->display_name,
                'audience_summary' => $event->audience_profile,
                'support_needs' => $event->support_needs,
                'evidence_count' => $event->audienceEvidence->count(),
                'package_count' => $event->packages->count(),
            ]);

        return Inertia::render('sponsor/Events', [
            'events' => $events,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'category' => $request->string('category')->toString(),
                'location' => $request->string('location')->toString(),
                'date_from' => $request->string('date_from')->toString(),
                'date_to' => $request->string('date_to')->toString(),
                'support_type' => $request->string('support_type')->toString(),
            ],
            'categories' => Event::published()->distinct()->orderBy('category')->pluck('category'),
            'supportTypes' => collect(SupportType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => match ($type) {
                    SupportType::Cash => 'Dana tunai',
                    SupportType::Product => 'Produk',
                    SupportType::Service => 'Layanan',
                    SupportType::Media => 'Media',
                    SupportType::Other => 'Lainnya',
                },
            ])->values(),
        ]);
    }

    public function show(Request $request, Event $event): Response
    {
        abort_unless($event->status->isPublic(), 404);

        $event->load(['eoOrganization.verification', 'audienceEvidence', 'packages']);

        $user = $request->user();
        $shortlisted = $user instanceof \Illuminate\Contracts\Auth\Authenticatable
            && $user->isSponsor() && $user->organization
            ? $user->organization->shortlists()->where('event_id', $event->id)->exists()
            : false;

        return Inertia::render('sponsor/Peluang', [
            'event' => [
                'id' => $event->id,
                'slug' => $event->slug,
                'title' => $event->title,
                'category' => $event->category,
                'format' => $event->format,
                'date_start' => $event->date_start->toDateString(),
                'date_end' => $event->date_end?->toDateString(),
                'location' => $event->location,
                'description' => $event->description,
                'audience_profile' => $event->audience_profile,
                'capacity_estimate' => $event->capacity_estimate,
                'support_needs' => $event->support_needs,
                'published_at' => $event->published_at?->toDateString(),
                'organizer' => [
                    'id' => $event->eoOrganization->id,
                    'name' => $event->eoOrganization->display_name,
                    'description' => $event->eoOrganization->description,
                    'location' => $event->eoOrganization->location,
                    'rating_average' => $event->eoOrganization->rating_average,
                    'review_count' => $event->eoOrganization->review_count,
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
                    'notes' => $package->notes,
                ]),
                'shortlisted' => $shortlisted,
            ],
        ]);
    }
}
