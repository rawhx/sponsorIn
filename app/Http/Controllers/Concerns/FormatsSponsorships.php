<?php

namespace App\Http\Controllers\Concerns;

use App\Enums\ReviewStatus;
use App\Enums\SponsorshipStatus;
use App\Models\Organization;
use App\Models\Review;
use App\Models\Sponsorship;

trait FormatsSponsorships
{
    protected function sponsorshipSummary(Sponsorship $sponsorship, Organization $organization): array
    {
        $counterpart = $organization->id === $sponsorship->sponsor_org_id
            ? $sponsorship->eoOrganization
            : $sponsorship->sponsorOrganization;

        return [
            'id' => $sponsorship->id,
            'event_title' => $sponsorship->event->title,
            'event_slug' => $sponsorship->event->slug,
            'role' => $organization->id === $sponsorship->sponsor_org_id ? 'sponsor' : 'eo',
            'counterpart' => $counterpart->display_name,
            'status' => $sponsorship->status->value,
            'completion_requested_by' => $sponsorship->completion_requested_by,
            'viewer_org_id' => $organization->id,
            'has_review' => $sponsorship->relationLoaded('review')
                ? $sponsorship->review !== null
                : $sponsorship->review()->exists(),
            'updated_at' => ($sponsorship->updated_at ?? $sponsorship->created_at)?->toISOString(),
        ];
    }

    protected function sponsorshipDetail(Sponsorship $sponsorship, Organization $organization): array
    {
        $isSponsor = $organization->id === $sponsorship->sponsor_org_id;
        $review = $sponsorship->review;

        return [
            'id' => $sponsorship->id,
            'event' => [
                'title' => $sponsorship->event->title,
                'slug' => $sponsorship->event->slug,
                'location' => $sponsorship->event->location,
                'date_start' => $sponsorship->event->date_start?->toDateString(),
                'date_end' => $sponsorship->event->date_end?->toDateString(),
            ],
            'sponsor' => $sponsorship->sponsorOrganization->display_name,
            'eo' => $sponsorship->eoOrganization->display_name,
            'role' => $isSponsor ? 'sponsor' : 'eo',
            'viewer_org_id' => $organization->id,
            'agreed_terms' => $sponsorship->agreed_terms,
            'deliverables' => $sponsorship->deliverables,
            'status' => $sponsorship->status->value,
            'accepted_at' => $sponsorship->accepted_at?->toISOString(),
            'completed_at' => $sponsorship->completed_at?->toISOString(),
            'completion_requested_by' => $sponsorship->completion_requested_by,
            'completion_requested_at' => $sponsorship->completion_requested_at?->toISOString(),
            'dispute_reason' => $sponsorship->dispute_reason,
            'can_review' => $isSponsor && $sponsorship->status === SponsorshipStatus::Completed,
            'can_edit_review' => $isSponsor && $review && $review->status === ReviewStatus::Published
                && $review->submitted_at?->greaterThan(now()->subHours(24)),
            'review' => $review ? $this->reviewPayload($review) : null,
            'proposal_id' => $sponsorship->proposal_id,
        ];
    }

    protected function reviewPayload(Review $review): array
    {
        return [
            'id' => $review->id,
            'overall_rating' => $review->overall_rating,
            'communication_rating' => $review->communication_rating,
            'professionalism_rating' => $review->professionalism_rating,
            'deliverables_rating' => $review->deliverables_rating,
            'comment' => $review->comment,
            'status' => $review->status->value,
            'submitted_at' => $review->submitted_at?->toISOString(),
            'edited_at' => $review->edited_at?->toISOString(),
        ];
    }

    protected function sponsorshipStatusOptions(): array
    {
        return collect(SponsorshipStatus::cases())->map(fn ($status) => [
            'value' => $status->value,
            'label' => match ($status) {
                SponsorshipStatus::Active => 'Aktif',
                SponsorshipStatus::CompletionRequested => 'Menunggu konfirmasi penyelesaian',
                SponsorshipStatus::Completed => 'Selesai',
                SponsorshipStatus::Disputed => 'Sengketa',
                SponsorshipStatus::NeedsAdminReview => 'Menunggu peninjauan admin',
                SponsorshipStatus::Cancelled => 'Dibatalkan',
            },
        ])->values()->all();
    }
}
