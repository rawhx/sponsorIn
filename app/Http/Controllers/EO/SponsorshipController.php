<?php

namespace App\Http\Controllers\EO;

use App\Enums\SponsorshipStatus;
use App\Http\Controllers\Concerns\FormatsSponsorships;
use App\Http\Controllers\Concerns\FormatsProposals;
use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\Sponsorship;
use App\Notifications\SponsorshipStatusNotification;
use App\Notifications\NewMessageNotification;
use App\Services\MessageService;
use App\Services\SponsorshipService;
use App\Services\ProposalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SponsorshipController extends Controller
{
    use FormatsSponsorships;
    use FormatsProposals;

    public function index(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $filters = $request->validate([
            'status' => ['nullable', 'string'],
        ]);

        $query = Sponsorship::query()
            ->where('eo_org_id', $organization->id)
            ->with(['event', 'sponsorOrganization', 'eoOrganization', 'review']);

        if ($request->filled('status')) {
            $query->where('status', $filters['status']);
        }

        $sponsorships = $query->latest('updated_at')->paginate(12)->withQueryString()
            ->through(fn (Sponsorship $sponsorship) => $this->sponsorshipSummary($sponsorship, $organization));

        return Inertia::render('eo/Sponsorships', [
            'sponsorships' => $sponsorships,
            'filters' => ['status' => $request->string('status')->toString()],
            'statuses' => $this->sponsorshipStatusOptions(),
            'counts' => [
                'active' => Sponsorship::where('eo_org_id', $organization->id)->where('status', SponsorshipStatus::Active)->count(),
                'pending' => Sponsorship::where('eo_org_id', $organization->id)->where('status', SponsorshipStatus::CompletionRequested)->count(),
                'completed' => Sponsorship::where('eo_org_id', $organization->id)->where('status', SponsorshipStatus::Completed)->count(),
            ],
        ]);
    }

    public function show(Request $request, Sponsorship $sponsorship): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization && $sponsorship->isParty($organization), 403);
        abort_unless($sponsorship->eo_org_id === $organization->id, 403);

        $sponsorship->load(['event', 'sponsorOrganization', 'eoOrganization', 'review', 'proposal.conversation.messages.sender']);

        return Inertia::render('eo/SponsorshipDetail', [
            'sponsorship' => $this->sponsorshipDetail($sponsorship, $organization),
        ]);
    }

    public function proposal(Request $request, Proposal $proposal, ProposalService $service): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization && $proposal->isParty($organization), 403);

        $proposal->load(['event.packages', 'package', 'senderOrganization', 'recipientOrganization', 'conversation.messages.sender']);

        return Inertia::render('eo/ProposalDetail', [
            'proposal' => $this->proposalDetail($proposal, $organization),
            'viewerOrganizationId' => $organization->id,
            'transitions' => $service->availableTransitions($proposal, $organization),
            'statuses' => $this->proposalStatusOptions(),
            'managementContext' => true,
        ]);
    }

    public function message(Sponsorship $sponsorship, Request $request, MessageService $messages): RedirectResponse
    {
        $organization = $request->user()->organization;
        abort_unless($organization && $sponsorship->isParty($organization) && $sponsorship->eo_org_id === $organization->id, 403);
        abort_unless($sponsorship->proposal, 404);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $messages->post($sponsorship->proposal, $request->user(), $data['body']);
        $sponsorship->sponsorOrganization->owner?->notify(new NewMessageNotification($sponsorship->proposal));

        return back()->with('success', 'Pesan terkirim.');
    }

    public function requestCompletion(Sponsorship $sponsorship, Request $request, SponsorshipService $service): RedirectResponse
    {
        $service->requestCompletion($sponsorship, $request->user());

        $sponsorship->sponsorOrganization->owner?->notify(
            new SponsorshipStatusNotification($sponsorship, SponsorshipStatus::CompletionRequested)
        );

        return back()->with('success', 'Permintaan penyelesaian dikirim ke sponsor.');
    }

    public function confirmCompletion(Sponsorship $sponsorship, Request $request, SponsorshipService $service): RedirectResponse
    {
        $service->confirmCompletion($sponsorship, $request->user());

        $sponsorship->sponsorOrganization->owner?->notify(
            new SponsorshipStatusNotification($sponsorship, SponsorshipStatus::Completed)
        );

        return back()->with('success', 'Kerja sama ditandai selesai.');
    }

    public function raiseDispute(Sponsorship $sponsorship, Request $request, SponsorshipService $service): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $service->raiseDispute($sponsorship, $request->user(), $data['reason']);

        $sponsorship->sponsorOrganization->owner?->notify(
            new SponsorshipStatusNotification($sponsorship, SponsorshipStatus::Disputed)
        );

        return back()->with('success', 'Sengketa diajukan untuk peninjauan.');
    }
}
