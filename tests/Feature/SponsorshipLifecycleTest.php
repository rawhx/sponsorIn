<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\ProposalStatus;
use App\Enums\SponsorshipStatus;
use App\Models\Event;
use App\Models\Message;
use App\Models\Proposal;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class SponsorshipLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_sponsorship_created_from_accepted_proposal(): void
    {
        $eoOrg = $this->eoOrganization();
        $sponsorOrg = $this->activeSponsorOrganization();
        $sponsorUser = User::where('id', $sponsorOrg->owner_user_id)->first();
        $event = Event::factory()->create([
            'eo_organization_id' => $eoOrg->id,
            'status' => EventStatus::Published,
        ]);

        $proposal = Proposal::factory()
            ->for($event)
            ->for($sponsorOrg, 'senderOrganization')
            ->for($eoOrg, 'recipientOrganization')
            ->create([
                'status' => ProposalStatus::Accepted,
                'requested_support' => 'Dana tunai Rp5.000.000',
                'terms_summary' => 'Kesepakatan dasar',
            ]);

        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));

        $sponsorship = Sponsorship::where('proposal_id', $proposal->id)->first();
        $this->assertNotNull($sponsorship);
        $this->assertEquals(SponsorshipStatus::Active, $sponsorship->status);
        $this->assertEquals($eoOrg->id, $sponsorship->eo_org_id);
    }

    public function test_both_parties_can_request_and_confirm_completion(): void
    {
        $eoOrg = $this->eoOrganization();
        $eoUser = User::where('id', $eoOrg->owner_user_id)->first();
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
            ->create(['status' => SponsorshipStatus::Active]);

        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.request-completion', $sponsorship));
        $sponsorship->refresh();
        $this->assertEquals(SponsorshipStatus::CompletionRequested, $sponsorship->status);
        $this->assertEquals($sponsorOrg->id, $sponsorship->completion_requested_by);

        $this->actingAs($eoUser)->post(route('eo.sponsorships.confirm-completion', $sponsorship));
        $sponsorship->refresh();
        $this->assertEquals(SponsorshipStatus::Completed, $sponsorship->status);
    }

    public function test_both_parties_can_chat_from_management_detail(): void
    {
        $eoOrg = $this->eoOrganization();
        $eoUser = User::where('id', $eoOrg->owner_user_id)->first();
        $sponsorOrg = $this->activeSponsorOrganization();
        $sponsorUser = User::where('id', $sponsorOrg->owner_user_id)->first();
        $event = Event::factory()->create(['eo_organization_id' => $eoOrg->id, 'status' => EventStatus::Published]);
        $proposal = Proposal::factory()->for($event)
            ->for($sponsorOrg, 'senderOrganization')
            ->for($eoOrg, 'recipientOrganization')
            ->create(['status' => ProposalStatus::Accepted]);
        $proposal->conversation()->create(['participant_org_ids' => [$sponsorOrg->id, $eoOrg->id]]);
        $sponsorship = Sponsorship::factory()->for($event)
            ->for($sponsorOrg, 'sponsorOrganization')
            ->for($eoOrg, 'eoOrganization')
            ->create(['proposal_id' => $proposal->id, 'status' => SponsorshipStatus::Active]);

        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.messages.store', $sponsorship), [
            'body' => 'Kami siap membahas detail aktivasi.',
        ])->assertSessionHasNoErrors();

        $this->actingAs($eoUser)->post(route('eo.sponsorships.messages.store', $sponsorship), [
            'body' => 'Baik, kami kirimkan detailnya.',
        ])->assertSessionHasNoErrors();

        $this->assertCount(2, Message::where('conversation_id', $proposal->conversation->id)->get());
    }

    public function test_same_party_cannot_confirm_completion_they_requested(): void
    {
        $eoOrg = $this->eoOrganization();
        $eoUser = User::where('id', $eoOrg->owner_user_id)->first();
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
            ->create([
                'status' => SponsorshipStatus::CompletionRequested,
                'completion_requested_by' => $sponsorOrg->id,
                'completion_requested_at' => now(),
            ]);

        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.confirm-completion', $sponsorship));
        $sponsorship->refresh();
        $this->assertEquals(SponsorshipStatus::CompletionRequested, $sponsorship->status);
    }

    public function test_escalates_stale_completion_requests_after_seven_days(): void
    {
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
            ->create([
                'status' => SponsorshipStatus::CompletionRequested,
                'completion_requested_by' => $sponsorOrg->id,
                'completion_requested_at' => Carbon::now()->subDays(8),
            ]);

        $this->artisan('sponsorship:escalate-stale');
        $sponsorship->refresh();
        $this->assertEquals(SponsorshipStatus::NeedsAdminReview, $sponsorship->status);
    }
}
