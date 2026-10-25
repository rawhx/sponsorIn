<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SponsorshipStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Sponsorship;
use App\Notifications\SponsorshipStatusNotification;
use App\Services\SponsorshipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Antrean keputusan admin untuk sponsorship yang disengketakan atau tanpa respons 7 hari.
 */
class SponsorshipController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['disputed', 'needs_admin_review', 'completed', 'cancelled', 'active', 'completion_requested'])],
        ]);

        $status = $filters['status'] ?? null;

        $query = Sponsorship::query()
            ->with(['event', 'sponsorOrganization', 'eoOrganization'])
            ->when(
                $status,
                fn ($q) => $q->where('status', $status),
                fn ($q) => $q->whereIn('status', SponsorshipService::ADMIN_RESOLVABLE),
            )
            ->latest('updated_at');

        $sponsorships = $query->paginate(15)->withQueryString()->through(fn (Sponsorship $sponsorship) => [
            'id' => $sponsorship->id,
            'event_title' => $sponsorship->event->title,
            'sponsor' => $sponsorship->sponsorOrganization->display_name,
            'eo' => $sponsorship->eoOrganization->display_name,
            'status' => $sponsorship->status->value,
            'dispute_reason' => $sponsorship->dispute_reason ? (string) str($sponsorship->dispute_reason)->limit(100) : null,
            'updated_at' => $sponsorship->updated_at?->toISOString(),
        ]);

        return Inertia::render('admin/Sponsorships', [
            'sponsorships' => $sponsorships,
            'filters' => ['status' => $request->string('status')->toString()],
            'counts' => [
                'disputed' => Sponsorship::where('status', SponsorshipStatus::Disputed)->count(),
                'needs_admin_review' => Sponsorship::where('status', SponsorshipStatus::NeedsAdminReview)->count(),
            ],
        ]);
    }

    public function show(Sponsorship $sponsorship): Response
    {
        $sponsorship->load(['event', 'sponsorOrganization', 'eoOrganization', 'review']);

        return Inertia::render('admin/SponsorshipDetail', [
            'sponsorship' => [
                'id' => $sponsorship->id,
                'status' => $sponsorship->status->value,
                'event' => [
                    'title' => $sponsorship->event->title,
                    'location' => $sponsorship->event->location,
                    'date_start' => $sponsorship->event->date_start?->toDateString(),
                    'date_end' => $sponsorship->event->date_end?->toDateString(),
                ],
                'sponsor' => $sponsorship->sponsorOrganization->display_name,
                'eo' => $sponsorship->eoOrganization->display_name,
                'agreed_terms' => $sponsorship->agreed_terms,
                'deliverables' => $sponsorship->deliverables,
                'accepted_at' => $sponsorship->accepted_at?->toISOString(),
                'completion_requested_at' => $sponsorship->completion_requested_at?->toISOString(),
                'completed_at' => $sponsorship->completed_at?->toISOString(),
                'dispute_reason' => $sponsorship->dispute_reason,
                'cancellation_reason' => $sponsorship->cancellation_reason,
                'admin_resolution_note' => $sponsorship->admin_resolution_note,
                'has_review' => $sponsorship->review !== null,
                'can_resolve' => in_array($sponsorship->status, SponsorshipService::ADMIN_RESOLVABLE, true),
            ],
            'auditLogs' => AuditLog::with('actor')
                ->where('entity_type', Sponsorship::class)
                ->where('entity_id', $sponsorship->id)
                ->latest()
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'actor' => $log->actor?->name,
                    'reason' => $log->reason,
                    'created_at' => $log->created_at->toISOString(),
                ]),
        ]);
    }

    public function resolve(Request $request, Sponsorship $sponsorship, SponsorshipService $service): RedirectResponse
    {
        $data = $request->validate([
            'decision' => ['required', Rule::in(['completed', 'cancelled', 'active'])],
            'note' => ['required', 'string', 'max:1000'],
        ]);

        $decision = SponsorshipStatus::from($data['decision']);

        $service->adminResolve($sponsorship, $request->user(), $decision, $data['note']);

        $sponsorship->loadMissing(['sponsorOrganization.owner', 'eoOrganization.owner']);
        foreach ([$sponsorship->sponsorOrganization->owner, $sponsorship->eoOrganization->owner] as $owner) {
            $owner?->notify(new SponsorshipStatusNotification($sponsorship, $decision));
        }

        return redirect()
            ->route('admin.sponsorships.show', $sponsorship)
            ->with('success', 'Keputusan sponsorship disimpan.');
    }
}
