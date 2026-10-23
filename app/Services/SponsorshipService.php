<?php

namespace App\Services;

use App\Enums\ProposalStatus;
use App\Enums\SponsorshipStatus;
use App\Models\Organization;
use App\Models\Proposal;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SponsorshipService
{
    public function __construct(private AuditLogger $audit) {}

    /**
     * Buat record sponsorship dari proposal yang sudah diterima kedua pihak.
     */
    public function createFromProposal(Proposal $proposal, User $actor): Sponsorship
    {
        $organization = $actor->organization;
        abort_unless($organization && $proposal->isParty($organization), 403);
        abort_unless($proposal->status === ProposalStatus::Accepted, 422, 'Proposal belum diterima kedua pihak.');

        if ($proposal->sponsorship) {
            return $proposal->sponsorship;
        }

        return DB::transaction(function () use ($proposal, $actor) {
            $sponsorship = $proposal->sponsorship()->create([
                'sponsor_org_id' => $this->sponsorOrgId($proposal),
                'eo_org_id' => $this->eoOrgId($proposal),
                'event_id' => $proposal->event_id,
                'agreed_terms' => $this->agreedTerms($proposal),
                'deliverables' => $proposal->deliverables,
                'status' => SponsorshipStatus::Active,
                'accepted_at' => now(),
            ]);

            $this->audit->record('sponsorship.active', $sponsorship, $actor, [], [
                'status' => SponsorshipStatus::Active->value,
                'proposal_id' => $proposal->id,
            ]);

            return $sponsorship;
        });
    }

    public function requestCompletion(Sponsorship $sponsorship, User $actor): Sponsorship
    {
        $organization = $this->party($sponsorship, $actor);
        abort_unless($sponsorship->status === SponsorshipStatus::Active, 422, 'Penyelesaian hanya bisa diminta pada sponsorship aktif.');

        $sponsorship->update([
            'status' => SponsorshipStatus::CompletionRequested,
            'completion_requested_by' => $organization->id,
            'completion_requested_at' => now(),
        ]);

        $this->audit->record('sponsorship.completion_requested', $sponsorship, $actor, [
            'status' => SponsorshipStatus::Active->value,
        ], [
            'status' => SponsorshipStatus::CompletionRequested->value,
        ]);

        return $sponsorship;
    }

    public function confirmCompletion(Sponsorship $sponsorship, User $actor): Sponsorship
    {
        $organization = $this->party($sponsorship, $actor);
        abort_unless($sponsorship->status === SponsorshipStatus::CompletionRequested, 422, 'Tidak ada permintaan penyelesaian untuk dikonfirmasi.');
        abort_if($sponsorship->completion_requested_by === $organization->id, 422, 'Pihak yang meminta penyelesaian tidak dapat mengonfirmasi sendiri.');

        $sponsorship->update([
            'status' => SponsorshipStatus::Completed,
            'completed_at' => now(),
        ]);

        $this->audit->record('sponsorship.completed', $sponsorship, $actor, [
            'status' => SponsorshipStatus::CompletionRequested->value,
        ], [
            'status' => SponsorshipStatus::Completed->value,
        ]);

        return $sponsorship;
    }

    public function raiseDispute(Sponsorship $sponsorship, User $actor, string $reason): Sponsorship
    {
        $this->party($sponsorship, $actor);
        abort_unless($sponsorship->status === SponsorshipStatus::CompletionRequested, 422, 'Sengketa hanya bisa diajukan saat menunggu konfirmasi penyelesaian.');

        $sponsorship->update([
            'status' => SponsorshipStatus::Disputed,
            'dispute_reason' => $reason,
        ]);

        $this->audit->record('sponsorship.disputed', $sponsorship, $actor, [
            'status' => SponsorshipStatus::CompletionRequested->value,
        ], [
            'status' => SponsorshipStatus::Disputed->value,
        ], $reason);

        return $sponsorship;
    }

    /**
     * Peralihan otomatis keantrean admin bila tidak ada respons 7 hari.
     */
    public function escalateStale(Sponsorship $sponsorship): Sponsorship
    {
        if ($sponsorship->status !== SponsorshipStatus::CompletionRequested) {
            return $sponsorship;
        }

        $sponsorship->update(['status' => SponsorshipStatus::NeedsAdminReview]);

        $this->audit->record('sponsorship.needs_admin_review', $sponsorship, null, [
            'status' => SponsorshipStatus::CompletionRequested->value,
        ], [
            'status' => SponsorshipStatus::NeedsAdminReview->value,
        ], 'Tidak ada respons dalam 7 hari kalender.');

        return $sponsorship;
    }

    public function isParty(Sponsorship $sponsorship, User $user): bool
    {
        return $user->organization && $sponsorship->isParty($user->organization);
    }

    private function party(Sponsorship $sponsorship, User $actor): Organization
    {
        $organization = $actor->organization;
        abort_unless($organization && $sponsorship->isParty($organization), 403);

        return $organization;
    }

    private function sponsorOrgId(Proposal $proposal): int
    {
        return $proposal->senderOrganization->isSponsor() ? $proposal->sender_org_id : $proposal->recipient_org_id;
    }

    private function eoOrgId(Proposal $proposal): int
    {
        return $proposal->senderOrganization->isEo() ? $proposal->sender_org_id : $proposal->recipient_org_id;
    }

    private function agreedTerms(Proposal $proposal): string
    {
        $parts = array_filter([
            $proposal->requested_support,
            $proposal->terms_summary,
        ]);

        return implode("\n\n", $parts);
    }
}
