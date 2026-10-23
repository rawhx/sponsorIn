<?php

namespace App\Http\Controllers\Concerns;

use App\Enums\ProposalStatus;
use App\Models\Organization;
use App\Models\Proposal;

trait FormatsProposals
{
    protected function proposalSummary(Proposal $proposal, Organization $organization): array
    {
        return [
            'id' => $proposal->id,
            'direction' => $proposal->recipient_org_id === $organization->id ? 'incoming' : 'outgoing',
            'event_title' => $proposal->event->title,
            'event_slug' => $proposal->event->slug,
            'counterpart' => $proposal->recipient_org_id === $organization->id
                ? $proposal->senderOrganization->display_name
                : $proposal->recipientOrganization->display_name,
            'requested_support' => (string) str($proposal->requested_support)->limit(120),
            'status' => $proposal->status->value,
            'last_status_at' => $proposal->last_status_at?->toISOString(),
        ];
    }

    protected function proposalDetail(Proposal $proposal, Organization $organization): array
    {
        return [
            'id' => $proposal->id,
            'direction' => $proposal->recipient_org_id === $organization->id ? 'incoming' : 'outgoing',
            'event' => [
                'title' => $proposal->event->title,
                'slug' => $proposal->event->slug,
                'date_start' => $proposal->event->date_start->toDateString(),
                'date_end' => $proposal->event->date_end?->toDateString(),
                'location' => $proposal->event->location,
            ],
            'sender' => $proposal->senderOrganization->display_name,
            'recipient' => $proposal->recipientOrganization->display_name,
            'package' => $proposal->package ? [
                'id' => $proposal->package->id,
                'name' => $proposal->package->name,
                'support_type' => $proposal->package->support_type->value,
                'price_amount' => $proposal->package->price_amount,
                'currency' => $proposal->package->currency,
            ] : null,
            'requested_support' => $proposal->requested_support,
            'deliverables' => $proposal->deliverables,
            'terms_summary' => $proposal->terms_summary,
            'status' => $proposal->status->value,
            'valid_until' => $proposal->valid_until?->toDateString(),
            'last_status_at' => $proposal->last_status_at?->toISOString(),
            'conversation_id' => $proposal->conversation?->id,
            'sponsorship_id' => $proposal->sponsorship?->id,
            'messages' => $proposal->conversation?->messages()->with('sender')->oldest()->get()->map(fn ($message) => [
                'id' => $message->id,
                'body' => $message->body,
                'sender_name' => $message->sender->name,
                'sender_user_id' => $message->sender_user_id,
                'created_at' => $message->created_at->toISOString(),
            ]) ?? [],
        ];
    }

    protected function proposalStatusOptions(): array
    {
        return collect(ProposalStatus::cases())->map(fn ($status) => [
            'value' => $status->value,
            'label' => match ($status) {
                ProposalStatus::Draft => 'Draft',
                ProposalStatus::Sent => 'Terkirim',
                ProposalStatus::UnderReview => 'Sedang ditinjau',
                ProposalStatus::MoreInformationRequested => 'Perlu informasi',
                ProposalStatus::Negotiation => 'Negosiasi',
                ProposalStatus::Accepted => 'Diterima',
                ProposalStatus::Rejected => 'Ditolak',
                ProposalStatus::Withdrawn => 'Ditarik',
                ProposalStatus::Expired => 'Kedaluwarsa',
            },
        ])->values()->all();
    }

    protected function openProposalStatuses(): array
    {
        return [
            ProposalStatus::Sent,
            ProposalStatus::UnderReview,
            ProposalStatus::MoreInformationRequested,
            ProposalStatus::Negotiation,
            ProposalStatus::Accepted,
        ];
    }
}
