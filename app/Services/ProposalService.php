<?php

namespace App\Services;

use App\Enums\ProposalStatus;
use App\Enums\ProposalType;
use App\Models\Organization;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProposalService
{
    public function __construct(private AuditLogger $audit) {}

    public function create(User $actor, array $data): Proposal
    {
        $actorOrganization = $actor->organization;
        $event = $data['event'];
        $counterpart = $data['counterpart_organization'];

        [$sender, $recipient, $type] = $this->resolveParties($actorOrganization, $counterpart, $event);

        return DB::transaction(function () use ($event, $sender, $recipient, $type, $data, $actor) {
            $proposal = Proposal::create([
                'event_id' => $event->id,
                'sender_org_id' => $sender->id,
                'recipient_org_id' => $recipient->id,
                'proposal_type' => $type,
                'package_id' => $data['package_id'] ?? null,
                'requested_support' => $data['requested_support'],
                'deliverables' => $data['deliverables'] ?? null,
                'terms_summary' => $data['terms_summary'] ?? null,
                'valid_until' => $data['valid_until'] ?? null,
                'status' => ProposalStatus::Sent,
                'last_status_at' => now(),
            ]);

            $proposal->conversation()->create([
                'participant_org_ids' => [$sender->id, $recipient->id],
            ]);

            $this->audit->record('proposal.sent', $proposal, $actor, [], [
                'status' => ProposalStatus::Sent->value,
                'sender_org_id' => $sender->id,
                'recipient_org_id' => $recipient->id,
            ]);

            return $proposal;
        });
    }

    /**
     * Apply a status transition performed by one of the two parties.
     *
     * @return array{proposal: Proposal, previous: ProposalStatus}
     */
    public function transition(Proposal $proposal, User $actor, ProposalStatus $to, ?string $reason = null): array
    {
        $actorOrganization = $actor->organization;
        abort_unless($actorOrganization && $proposal->isParty($actorOrganization), 403);

        $from = $proposal->status;

        abort_unless($this->canTransition($from, $to, $actorOrganization, $proposal), 422, 'Transisi status tidak diizinkan.');

        $proposal->update([
            'status' => $to,
            'last_status_at' => now(),
            'sponsor_confirmed_at' => $to === ProposalStatus::Accepted && $actorOrganization->isSponsor()
                ? now()
                : $proposal->sponsor_confirmed_at,
            'eo_confirmed_at' => $to === ProposalStatus::Accepted && $actorOrganization->isEo()
                ? now()
                : $proposal->eo_confirmed_at,
        ]);

        $this->audit->record(
            'proposal.'.$to->value,
            $proposal,
            $actor,
            ['status' => $from->value],
            ['status' => $to->value],
            $reason,
        );

        return ['proposal' => $proposal, 'previous' => $from];
    }

    private function canTransition(ProposalStatus $from, ProposalStatus $to, Organization $actorOrganization, Proposal $proposal): bool
    {
        $isSender = $proposal->sender_org_id === $actorOrganization->id;
        $isRecipient = $proposal->recipient_org_id === $actorOrganization->id;

        return match ($to) {
            // Penerima mengevaluasi.
            ProposalStatus::UnderReview => $isRecipient && $from === ProposalStatus::Sent,
            // Penerima meminta informasi.
            ProposalStatus::MoreInformationRequested => $isRecipient && in_array($from, [ProposalStatus::Sent, ProposalStatus::UnderReview], true),
            // Kedua pihak bisa membuka negosiasi.
            ProposalStatus::Negotiation => ($isSender || $isRecipient) && in_array($from, [ProposalStatus::Sent, ProposalStatus::UnderReview, ProposalStatus::MoreInformationRequested], true),
            // Penerima menerima proposal.
            ProposalStatus::Accepted => $isRecipient && $this->isOpen($from) && $from !== ProposalStatus::Accepted,
            // Penerima menolak.
            ProposalStatus::Rejected => $isRecipient && $this->isOpen($from) && $from !== ProposalStatus::Accepted,
            // Pengirim menarik sebelum kesepakatan.
            ProposalStatus::Withdrawn => $isSender && $from !== ProposalStatus::Accepted && $this->isOpen($from),
            default => false,
        };
    }

    private function isOpen(ProposalStatus $status): bool
    {
        return $status->isOpen();
    }

    /**
     * Transisi yang tersedia bagi pihak tertentu.
     *
     * @return array<int, string>
     */
    public function availableTransitions(Proposal $proposal, Organization $organization): array
    {
        if (! $proposal->isParty($organization)) {
            return [];
        }

        $isSender = $proposal->sender_org_id === $organization->id;
        $isRecipient = $proposal->recipient_org_id === $organization->id;
        $from = $proposal->status;

        $allowed = [];

        if ($isRecipient) {
            if ($from === ProposalStatus::Sent) {
                $allowed[] = ProposalStatus::UnderReview->value;
                $allowed[] = ProposalStatus::MoreInformationRequested->value;
                $allowed[] = ProposalStatus::Negotiation->value;
            }
            if ($from === ProposalStatus::UnderReview) {
                $allowed[] = ProposalStatus::MoreInformationRequested->value;
                $allowed[] = ProposalStatus::Negotiation->value;
            }
            if ($from === ProposalStatus::MoreInformationRequested) {
                $allowed[] = ProposalStatus::Negotiation->value;
            }
            if ($this->isOpen($from) && $from !== ProposalStatus::Accepted) {
                $allowed[] = ProposalStatus::Accepted->value;
                $allowed[] = ProposalStatus::Rejected->value;
            }
        }

        if ($isSender) {
            if ($from === ProposalStatus::MoreInformationRequested) {
                $allowed[] = ProposalStatus::Negotiation->value;
            }
            if ($this->isOpen($from) && $from !== ProposalStatus::Accepted) {
                $allowed[] = ProposalStatus::Withdrawn->value;
            }
        }

        return array_values(array_unique($allowed));
    }

    /**
     * @return array{0: Organization, 1: Organization, 2: ProposalType}
     */
    private function resolveParties(?Organization $actorOrganization, Organization $counterpart, $event): array
    {
        abort_unless($actorOrganization, 403);

        if ($actorOrganization->isSponsor()) {
            abort_unless($counterpart->id === $event->eo_organization_id, 422, 'EO tidak terkait dengan event ini.');

            return [$actorOrganization, $counterpart, ProposalType::SponsorToEo];
        }

        abort_if($actorOrganization->isEo() && $event->eo_organization_id !== $actorOrganization->id, 403);
        abort_unless($counterpart->isSponsor(), 422, 'Penerima proposal harus berupa sponsor.');
        abort_unless($counterpart->proposal_preference->acceptsProposals(), 422, 'Sponsor ini tidak menerima proposal.');

        return [$actorOrganization, $counterpart, ProposalType::EoToSponsor];
    }
}
