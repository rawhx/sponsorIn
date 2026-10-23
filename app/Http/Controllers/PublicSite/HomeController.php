<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $published = Event::published();

        $events = (clone $published)
            ->with(['eoOrganization', 'audienceEvidence', 'packages'])
            ->orderBy('date_start')
            ->take(3)
            ->get()
            ->map(fn (Event $event) => [
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

        $categories = (clone $published)
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        $stats = [
            'events' => (clone $published)->count(),
            'organizers' => (clone $published)->distinct()->count('eo_organization_id'),
            'regions' => (clone $published)->distinct()->count('location'),
        ];

        return Inertia::render('public/Home', [
            'featuredEvents' => $events,
            'categories' => $categories,
            'stats' => $stats,
        ]);
    }
}
