<?php

namespace App\Http\Controllers\Sponsor;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShortlistController extends Controller
{
    public function index(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $events = $organization->shortlists()
            ->with(['event.eoOrganization'])
            ->whereHas('event', fn ($query) => $query->where('status', EventStatus::Published))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn ($shortlist) => [
                'id' => $shortlist->event->id,
                'slug' => $shortlist->event->slug,
                'title' => $shortlist->event->title,
                'category' => $shortlist->event->category,
                'date_start' => $shortlist->event->date_start->toDateString(),
                'date_end' => $shortlist->event->date_end?->toDateString(),
                'location' => $shortlist->event->location,
                'organizer' => $shortlist->event->eoOrganization->display_name,
                'shortlisted_at' => $shortlist->created_at->toISOString(),
            ]);

        return Inertia::render('sponsor/Shortlist', [
            'events' => $events,
        ]);
    }

    public function store(Request $request, Event $event): RedirectResponse
    {
        abort_unless($event->status === EventStatus::Published, 404);

        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $organization->shortlists()->firstOrCreate(['event_id' => $event->id]);

        return back()->with('success', 'Event ditambahkan ke shortlist.');
    }

    public function destroy(Request $request, Event $event): RedirectResponse
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $organization->shortlists()->where('event_id', $event->id)->delete();

        return back()->with('success', 'Event dihapus dari shortlist.');
    }
}
