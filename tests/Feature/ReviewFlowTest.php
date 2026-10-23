<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\SponsorshipStatus;
use App\Models\Event;
use App\Models\Review;
use App\Models\Sponsorship;
use App\Models\User;
use App\Services\ReviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ReviewFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_sponsor_can_review_completed_sponsorship_and_eo_rating_updates(): void
    {
        $eoOrg = $this->eoOrganization();
        $sponsorOrg = $this->activeSponsorOrganization();
        $sponsorUser = User::where('id', $sponsorOrg->owner_user_id)->first();
        $event = Event::factory()->create([
            'eo_organization_id' => $eoOrg->id,
            'status' => EventStatus::Published,
        ]);

        $sponsorship = Sponsorship::factory()
            ->for($event)
            ->for($sponsorOrg, 'sponsorOrganization')
            ->for($eoOrg, 'eoOrganization')
            ->create(['status' => SponsorshipStatus::Completed]);

        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.review.store', $sponsorship), [
            'overall_rating' => 5,
            'communication_rating' => 5,
            'professionalism_rating' => 4,
            'deliverables_rating' => 5,
            'comment' => 'Kerja sama berjalan lancar.',
        ]);

        $eoOrg->refresh();
        $this->assertEquals(1, $eoOrg->review_count);
        $this->assertGreaterThan(0, (float) $eoOrg->rating_average);
    }

    public function test_admin_can_hide_review_and_rating_recalculates(): void
    {
        $admin = User::factory()->admin()->create();
        $eoOrg = $this->eoOrganization();
        $sponsorOrg = $this->activeSponsorOrganization();
        $event = Event::factory()->create([
            'eo_organization_id' => $eoOrg->id,
            'status' => EventStatus::Published,
        ]);

        $sponsorship = Sponsorship::factory()
            ->for($event)
            ->for($sponsorOrg, 'sponsorOrganization')
            ->for($eoOrg, 'eoOrganization')
            ->create(['status' => SponsorshipStatus::Completed]);

        $review = Review::factory()
            ->for($sponsorship)
            ->create([
                'submitted_at' => Carbon::now()->subHours(25),
                'published_at' => Carbon::now()->subHours(25),
            ]);

        app(ReviewService::class)->recalculate($eoOrg);
        $eoOrg->refresh();
        $before = $eoOrg->review_count;

        $this->actingAs($admin)->post(route('admin.reviews.hide', $review), ['reason' => 'Melanggar pedoman']);
        $eoOrg->refresh();
        $this->assertEquals(max(0, $before - 1), $eoOrg->review_count);
    }
}
