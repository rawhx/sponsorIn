<?php

namespace App\Http\Controllers\EO;

use App\Enums\EventStatus;
use App\Enums\ProposalStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $events = $organization->events()
            ->where('date_start', '>=', now()->toDateString())
            ->orderBy('date_start')
            ->get(['id', 'title', 'date_start', 'location', 'status']);

        return Inertia::render('eo/Dashboard', [
            'organization' => [
                'name' => $organization->display_name,
                'description' => $organization->description,
                'location' => $organization->location,
                'rating_average' => $organization->rating_average,
                'review_count' => $organization->review_count,
            ],
            'counts' => [
                'draft' => $organization->events()->where('status', EventStatus::Draft)->count(),
                'under_review' => $organization->events()->where('status', EventStatus::UnderReview)->count(),
                'published' => $organization->events()->where('status', EventStatus::Published)->count(),
                'needs_changes' => $organization->events()->where('status', EventStatus::NeedsChanges)->count(),
                'proposals_total' => $organization->proposalsSent()->count(),
                'proposals_published' => $organization->proposalsSent()->whereIn('status', [ProposalStatus::Sent, ProposalStatus::UnderReview, ProposalStatus::Negotiation, ProposalStatus::MoreInformationRequested])->count(),
                'proposals_draft' => $organization->proposalsSent()->where('status', ProposalStatus::Draft)->count(),
                'proposals_interest' => $organization->proposalsReceived()->whereIn('status', [ProposalStatus::Sent, ProposalStatus::UnderReview, ProposalStatus::Negotiation])->count(),
                'sponsorships_active' => $organization->events->flatMap->sponsorships->whereIn('status', ['active', 'in_progress'])->count(),
            ],
            'upcomingEvents' => $events->take(5)->map(fn ($event) => [
                'id' => $event->id,
                'title' => $event->title,
                'date_start' => $event->date_start->toDateString(),
                'location' => $event->location,
                'status' => $event->status->value,
            ]),
        ]);
    }

    public function profile(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $publishedEvents = $organization->events()
            ->where('status', EventStatus::Published)
            ->orderBy('date_start')
            ->get(['id', 'title', 'location', 'date_start', 'date_end']);

        return Inertia::render('eo/Profile', [
            'organization' => [
                'name' => $organization->display_name,
                'description' => $organization->description,
                'location' => $organization->location,
                'category' => $organization->category,
                'legal_form' => null,
                'proposal_preference' => null,
                'rating_average' => $organization->rating_average,
                'review_count' => $organization->review_count,
            ],
            'verifications' => [],
            'currentVerification' => null,
            'events' => $publishedEvents,
            'eventsCount' => $publishedEvents->count(),
            'publishedEventsCount' => $publishedEvents->count(),
            'reviews' => [],
            'totalRatings' => $organization->review_count ?? 0,
            'averageRating' => $organization->rating_average,
        ]);
    }
}
