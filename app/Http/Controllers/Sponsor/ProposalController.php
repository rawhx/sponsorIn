<?php

namespace App\Http\Controllers\Sponsor;

use App\Enums\EventStatus;
use App\Enums\ProposalStatus;
use App\Http\Controllers\Concerns\FormatsProposals;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Proposal;
use App\Notifications\NewMessageNotification;
use App\Notifications\ProposalStatusNotification;
use App\Services\MessageService;
use App\Services\ProposalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProposalController extends Controller
{
    use FormatsProposals;

    public function index(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(ProposalStatus::class)],
            'direction' => ['nullable', Rule::in(['incoming', 'outgoing'])],
        ]);

        $query = Proposal::query()
            ->where(fn ($q) => $q->where('sender_org_id', $organization->id)
                ->orWhere('recipient_org_id', $organization->id))
            ->with(['event', 'senderOrganization', 'recipientOrganization']);

        if ($request->filled('direction')) {
            $query->where($filters['direction'] === 'incoming' ? 'recipient_org_id' : 'sender_org_id', $organization->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $filters['status']);
        }

        $proposals = $query->latest('last_status_at')->latest()->paginate(12)->withQueryString()
            ->through(fn (Proposal $proposal) => $this->proposalSummary($proposal, $organization));

        return Inertia::render('sponsor/Proposals', [
            'proposals' => $proposals,
            'filters' => [
                'status' => $request->string('status')->toString(),
                'direction' => $request->string('direction')->toString(),
            ],
            'counts' => [
                'incoming' => Proposal::where('recipient_org_id', $organization->id)->count(),
                'outgoing' => Proposal::where('sender_org_id', $organization->id)->count(),
                'open' => Proposal::where(fn ($q) => $q->where('sender_org_id', $organization->id)
                    ->orWhere('recipient_org_id', $organization->id))
                    ->whereIn('status', $this->openProposalStatuses())->count(),
            ],
            'statuses' => $this->proposalStatusOptions(),
        ]);
    }

    public function show(Request $request, Proposal $proposal, ProposalService $service): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization && $proposal->isParty($organization), 403);

        $proposal->load(['event.packages', 'package', 'senderOrganization', 'recipientOrganization', 'conversation.messages.sender']);

        return Inertia::render('sponsor/ProposalDetail', [
            'proposal' => $this->proposalDetail($proposal, $organization),
            'viewerOrganizationId' => $organization->id,
            'transitions' => $service->availableTransitions($proposal, $organization),
            'statuses' => $this->proposalStatusOptions(),
        ]);
    }

    public function store(Request $request, Event $event, ProposalService $service): RedirectResponse
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);
        abort_unless($event->status === EventStatus::Published, 404);

        $data = $request->validate([
            'package_id' => ['nullable', 'integer', Rule::exists('sponsorship_packages', 'id')->where('event_id', $event->id)],
            'requested_support' => ['required', 'string', 'max:3000'],
            'deliverables' => ['nullable', 'string', 'max:3000'],
            'terms_summary' => ['nullable', 'string', 'max:3000'],
            'valid_until' => ['nullable', 'date', 'after:today'],
        ]);

        $proposal = $service->create($request->user(), [
            ...$data,
            'event' => $event,
            'counterpart_organization' => $event->eoOrganization,
        ]);

        $proposal->recipientOrganization->owner?->notify(new ProposalStatusNotification($proposal, ProposalStatus::Sent));

        return redirect()
            ->route('sponsor.proposals.show', $proposal)
            ->with('success', 'Minat/penawaran dikirim ke EO.');
    }

    public function transition(Request $request, Proposal $proposal, ProposalService $service): RedirectResponse
    {
        $organization = $request->user()->organization;
        abort_unless($organization && $proposal->isParty($organization), 403);

        $data = $request->validate([
            'status' => ['required', Rule::enum(ProposalStatus::class)],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        ['proposal' => $proposal] = $service->transition(
            $proposal,
            $request->user(),
            ProposalStatus::from($data['status']),
            $data['reason'] ?? null,
        );

        $counterpart = $proposal->sender_org_id === $organization->id
            ? $proposal->recipientOrganization
            : $proposal->senderOrganization;

        $counterpart->owner?->notify(new ProposalStatusNotification($proposal, $proposal->status));

        return back()->with('success', 'Status proposal diperbarui.');
    }

    public function message(Request $request, Proposal $proposal, MessageService $messages): RedirectResponse
    {
        $organization = $request->user()->organization;
        abort_unless($organization && $proposal->isParty($organization), 403);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $messages->post($proposal, $request->user(), $data['body']);

        $counterpart = $proposal->sender_org_id === $organization->id
            ? $proposal->recipientOrganization
            : $proposal->senderOrganization;

        $counterpart->owner?->notify(new NewMessageNotification($proposal));

        return back()->with('success', 'Pesan terkirim.');
    }
}
