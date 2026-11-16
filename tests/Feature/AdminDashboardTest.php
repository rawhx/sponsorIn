<?php

namespace Tests\Feature;

use App\Enums\SponsorVerificationStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_shows_all_sponsor_verifications_requiring_action(): void
    {
        $admin = User::factory()->admin()->create();
        $submitted = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $underReview = $this->sponsorWithVerification(SponsorVerificationStatus::UnderReview);
        $needsInformation = $this->sponsorWithVerification(SponsorVerificationStatus::NeedsInformation);
        $this->sponsorWithVerification(SponsorVerificationStatus::Approved);

        $this->actingAs($admin)
            ->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/Dashboard')
                ->where('counts.pending_verifications', 3)
                ->has('pendingVerifications', 3)
                ->where('pendingVerifications', function ($items) use ($submitted, $underReview, $needsInformation) {
                    return collect($items)->pluck('organization_name')->sort()->values()->all() === collect([
                        $submitted->organization->display_name,
                        $underReview->organization->display_name,
                        $needsInformation->organization->display_name,
                    ])->sort()->values()->all();
                })
            );
    }
}
