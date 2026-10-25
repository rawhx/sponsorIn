<?php

namespace App\Services;

use App\Enums\ReviewStatus;
use App\Enums\SponsorshipStatus;
use App\Models\Organization;
use App\Models\Review;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    private const EDIT_WINDOW_HOURS = 24;

    public function __construct(private AuditLogger $audit) {}

    public function create(Sponsorship $sponsorship, User $actor, array $data): Review
    {
        $organization = $this->sponsorParty($sponsorship, $actor);
        abort_unless($sponsorship->status === SponsorshipStatus::Completed, 422, 'Ulasan hanya bisa diberikan setelah sponsorship selesai.');
        abort_if($sponsorship->review()->exists(), 422, 'Ulasan untuk sponsorship ini sudah ada.');

        return DB::transaction(function () use ($sponsorship, $organization, $data, $actor) {
            $review = $sponsorship->review()->create([
                'sponsor_org_id' => $organization->id,
                'eo_org_id' => $sponsorship->eo_org_id,
                'overall_rating' => $data['overall_rating'],
                'communication_rating' => $data['communication_rating'],
                'professionalism_rating' => $data['professionalism_rating'],
                'deliverables_rating' => $data['deliverables_rating'],
                'comment' => $data['comment'] ?? null,
                'status' => ReviewStatus::Published,
                'submitted_at' => now(),
                'published_at' => now(),
            ]);

            $this->recalculate($sponsorship->eoOrganization);
            $this->audit->record('review.published', $review, $actor, [], [
                'sponsorship_id' => $sponsorship->id,
                'overall_rating' => $review->overall_rating,
            ]);

            return $review;
        });
    }

    public function update(Review $review, User $actor, array $data): Review
    {
        $this->sponsorParty($review->sponsorship, $actor);
        abort_unless($this->withinEditWindow($review), 422, 'Batas waktu 24 jam untuk mengedit ulasan telah berakhir.');

        $review->update([
            'overall_rating' => $data['overall_rating'],
            'communication_rating' => $data['communication_rating'],
            'professionalism_rating' => $data['professionalism_rating'],
            'deliverables_rating' => $data['deliverables_rating'],
            'comment' => $data['comment'] ?? null,
            'edited_at' => now(),
        ]);

        $this->recalculate($review->sponsorship->eoOrganization);
        $this->audit->record('review.edited', $review, $actor, [], [
            'overall_rating' => $review->overall_rating,
        ]);

        return $review;
    }

    public function hide(Review $review, User $actor, string $reason): Review
    {
        abort_unless($actor->isStaff(), 403);
        abort_unless($review->status === ReviewStatus::Published, 422, 'Ulasan ini sudah disembunyikan.');

        $review->update([
            'status' => ReviewStatus::Hidden,
            'hidden_reason' => $reason,
        ]);

        $this->recalculate($review->sponsorship->eoOrganization);
        $this->audit->record('review.hidden', $review, $actor, [
            'status' => ReviewStatus::Published->value,
        ], [
            'status' => ReviewStatus::Hidden->value,
        ], $reason);

        return $review;
    }

    public function restore(Review $review, User $actor): Review
    {
        abort_unless($actor->isStaff(), 403);
        abort_unless($review->status === ReviewStatus::Hidden, 422, 'Ulasan ini tidak sedang disembunyikan.');

        $review->forceFill([
            'status' => ReviewStatus::Published,
            'hidden_reason' => null,
            'published_at' => $review->published_at ?? now(),
        ])->save();

        $this->recalculate($review->sponsorship->eoOrganization);
        $this->audit->record('review.restored', $review, $actor, [
            'status' => ReviewStatus::Hidden->value,
        ], [
            'status' => ReviewStatus::Published->value,
        ]);

        return $review;
    }

    public function clearOldEditWindow(Review $review): bool
    {
        return $this->withinEditWindow($review);
    }

    private function withinEditWindow(Review $review): bool
    {
        return $review->submitted_at !== null
            && $review->submitted_at->greaterThan(now()->subHours(self::EDIT_WINDOW_HOURS));
    }

    public function recalculate(Organization $eo): void
    {
        $ratings = Review::query()
            ->where('eo_org_id', $eo->id)
            ->where('status', ReviewStatus::Published)
            ->pluck('overall_rating');

        $eo->update([
            'review_count' => $ratings->count(),
            'rating_average' => $ratings->isEmpty() ? null : round($ratings->avg(), 1),
        ]);
    }

    private function sponsorParty(Sponsorship $sponsorship, User $actor): Organization
    {
        $organization = $actor->organization;
        abort_unless($organization && $sponsorship->isParty($organization), 403);
        abort_unless($organization->isSponsor(), 403, 'Hanya sponsor yang dapat memberi ulasan.');

        return $organization;
    }
}
