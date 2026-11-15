<?php

namespace App\Http\Controllers\Sponsor;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\Sponsorship;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $organization = $user->organization;
        $verification = $organization?->verification;

        $proposalQuery = Proposal::query()
            ->where('recipient_org_id', $organization?->id);

        $sponsorshipQuery = Sponsorship::query()
            ->where('sponsor_org_id', $organization?->id);

        return Inertia::render('sponsor/Dashboard', [
            'organization' => $organization ? [
                'name' => $organization->display_name,
                'location' => $organization->location,
                'proposal_preference' => $organization->proposal_preference->value,
            ] : null,
            'verification' => [
                'status' => $verification?->status->value ?? 'draft',
                'submitted_at' => $verification?->submitted_at?->toISOString(),
                'reviewed_at' => $verification?->reviewed_at?->toISOString(),
                'decision_reason_public' => $verification?->decision_reason_public,
            ],
            'canUseFeatures' => $user->hasActiveSponsorAccess(),
            'stats' => [
                'proposal_incoming' => $proposalQuery->clone()->count(),
                'proposal_active' => $proposalQuery->clone()->whereIn('status', ['sent', 'under_review', 'more_information_requested', 'negotiation'])->count(),
                'sponsorship_active' => $sponsorshipQuery->clone()->whereIn('status', ['active'])->count(),
                'sponsorship_total' => $sponsorshipQuery->clone()->count(),
            ],
        ]);
    }
}
