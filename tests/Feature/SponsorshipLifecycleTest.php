<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\ProposalStatus;
use App\Enums\SponsorshipStatus;
use App\Models\Event;
use App\Models\Proposal;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class SponsorshipLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private function acceptedProposal(array $overrides = []): array
    {
        $eoOrg = $this->eoOrganization();
        $sponsorOrg = $this->activeSponsorOrganization();
        $event = Event::factory()->create([
            'eo_organization_id' => $eoOrg->id,
            'status' => EventStatus::Published,
        ]);

        $proposal = Proposal::factory()
            ->for($event)
            ->for($sponsorOrg, 'senderOrganization')
            ->for($eoOrg, 'recipientOrganization')
            ->create(array_merge([
                'status' => ProposalStatus::Accepted,
                'requested_support' => 'Dana tunai Rp5.000.000',
                'terms_summary' => 'Kesepakatan dasar',
                // Penerima (EO) otomatis terkonfirmasi saat menerima proposal.
                'eo_confirmed_at' => now(),
            ], $overrides));

        return [$proposal, $sponsorOrg->owner, $eoOrg->owner, $sponsorOrg, $eoOrg];
    }

    public function test_sponsorship_created_only_after_both_parties_confirm_agreement(): void
    {
        [$proposal, $sponsorUser, , , $eoOrg] = $this->acceptedProposal();

        // Baru EO yang terkonfirmasi: konfirmasi sponsor mengikat kedua pihak dan membuat record.
        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));

        $sponsorship = Sponsorship::where('proposal_id', $proposal->id)->first();
        $this->assertNotNull($sponsorship);
        $this->assertEquals(SponsorshipStatus::Active, $sponsorship->status);
        $this->assertEquals($eoOrg->id, $sponsorship->eo_org_id);
        $this->assertNotNull($proposal->fresh()->sponsor_confirmed_at);
    }

    public function test_one_sided_confirmation_does_not_create_sponsorship(): void
    {
        // Proposal EO -> Sponsor: sponsor (penerima) menerima, EO belum mengonfirmasi.
        [$proposal, $sponsorUser] = $this->acceptedProposal([
            'proposal_type' => 'eo_to_sponsor',
            'eo_confirmed_at' => null,
            'sponsor_confirmed_at' => now(),
        ]);

        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));

        $this->assertDatabaseCount('sponsorships', 0);
    }

    public function test_eo_to_sponsor_deal_needs_eo_confirmation_before_sponsorship_exists(): void
    {
        [$proposal, $sponsorUser, $eoUser] = $this->acceptedProposal([
            'proposal_type' => 'eo_to_sponsor',
            'eo_confirmed_at' => null,
            'sponsor_confirmed_at' => now(),
        ]);

        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));
        $this->assertDatabaseCount('sponsorships', 0);

        $this->actingAs($eoUser)->post(route('eo.sponsorships.store', $proposal));
        $this->assertDatabaseCount('sponsorships', 1);
        $this->assertNotNull($proposal->fresh()->eo_confirmed_at);
    }

    public function test_confirming_agreement_twice_does_not_duplicate_sponsorship(): void
    {
        [$proposal, $sponsorUser] = $this->acceptedProposal();

        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));
        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));

        $this->assertDatabaseCount('sponsorships', 1);
    }

    public function test_non_party_cannot_confirm_agreement(): void
    {
        [$proposal] = $this->acceptedProposal();
        $outsider = $this->activeSponsorOrganization();

        $this->actingAs($outsider->owner)
            ->post(route('sponsor.sponsorships.store', $proposal))
            ->assertForbidden();

        $this->assertDatabaseCount('sponsorships', 0);
    }

    public function test_party_can_cancel_active_sponsorship_and_review_stays_closed(): void
    {
        [$proposal, $sponsorUser, $eoUser] = $this->acceptedProposal();
        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));
        $sponsorship = Sponsorship::firstOrFail();

        $this->actingAs($eoUser)
            ->post(route('eo.sponsorships.cancel', $sponsorship), ['reason' => 'Event dibatalkan oleh pihak venue.'])
            ->assertRedirect();

        $sponsorship->refresh();
        $this->assertEquals(SponsorshipStatus::Cancelled, $sponsorship->status);
        $this->assertSame('Event dibatalkan oleh pihak venue.', $sponsorship->cancellation_reason);
        $this->assertDatabaseHas('audit_logs', ['action' => 'sponsorship.cancelled', 'entity_id' => $sponsorship->id]);

        $this->actingAs($sponsorUser)
            ->post(route('sponsor.sponsorships.review.store', $sponsorship), [
                'overall_rating' => 5, 'communication_rating' => 5, 'professionalism_rating' => 5, 'deliverables_rating' => 5,
            ])
            ->assertStatus(422);
        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_admin_can_resolve_disputed_sponsorship_as_completed_and_unlock_review(): void
    {
        [$proposal, $sponsorUser, , , $eoOrg] = $this->acceptedProposal();
        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));
        $sponsorship = Sponsorship::firstOrFail();
        $sponsorship->update(['status' => SponsorshipStatus::Disputed, 'dispute_reason' => 'Deliverable belum lengkap.']);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.sponsorships.resolve', $sponsorship), ['decision' => 'completed', 'note' => 'Bukti deliverable diverifikasi.'])
            ->assertRedirect();

        $sponsorship->refresh();
        $this->assertEquals(SponsorshipStatus::Completed, $sponsorship->status);
        $this->assertNotNull($sponsorship->completed_at);
        $this->assertSame('Bukti deliverable diverifikasi.', $sponsorship->admin_resolution_note);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'sponsorship.admin_resolved',
            'entity_id' => $sponsorship->id,
            'actor_user_id' => $admin->id,
        ]);

        $this->actingAs($sponsorUser)
            ->post(route('sponsor.sponsorships.review.store', $sponsorship), [
                'overall_rating' => 4, 'communication_rating' => 4, 'professionalism_rating' => 4, 'deliverables_rating' => 4,
            ]);
        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_admin_can_resolve_stale_needs_admin_review_sponsorship_as_cancelled(): void
    {
        [$proposal, $sponsorUser] = $this->acceptedProposal();
        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));
        $sponsorship = Sponsorship::firstOrFail();
        $sponsorship->update(['status' => SponsorshipStatus::NeedsAdminReview]);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.sponsorships.resolve', $sponsorship), ['decision' => 'cancelled', 'note' => 'Tidak ada bukti pelaksanaan.']);

        $this->assertEquals(SponsorshipStatus::Cancelled, $sponsorship->fresh()->status);
    }

    public function test_admin_cannot_resolve_sponsorship_that_is_not_awaiting_review(): void
    {
        [$proposal, $sponsorUser] = $this->acceptedProposal();
        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));
        $sponsorship = Sponsorship::firstOrFail();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.sponsorships.resolve', $sponsorship), ['decision' => 'completed', 'note' => 'Coba paksa selesai.'])
            ->assertStatus(422);

        $this->assertEquals(SponsorshipStatus::Active, $sponsorship->fresh()->status);
    }

    public function test_resolution_requires_note_and_staff_role(): void
    {
        [$proposal, $sponsorUser, $eoUser] = $this->acceptedProposal();
        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));
        $sponsorship = Sponsorship::firstOrFail();
        $sponsorship->update(['status' => SponsorshipStatus::Disputed]);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.sponsorships.resolve', $sponsorship), ['decision' => 'completed'])
            ->assertSessionHasErrors('note');

        $this->actingAs($eoUser)
            ->post(route('admin.sponsorships.resolve', $sponsorship), ['decision' => 'completed', 'note' => 'x'])
            ->assertForbidden();
        $this->actingAs($sponsorUser)
            ->get(route('admin.sponsorships.index'))
            ->assertForbidden();

        $this->assertEquals(SponsorshipStatus::Disputed, $sponsorship->fresh()->status);
    }

    public function test_admin_queue_and_detail_pages_render(): void
    {
        [$proposal, $sponsorUser] = $this->acceptedProposal();
        $this->actingAs($sponsorUser)->post(route('sponsor.sponsorships.store', $proposal));
        $sponsorship = Sponsorship::firstOrFail();
        $sponsorship->update(['status' => SponsorshipStatus::Disputed, 'dispute_reason' => 'Contoh sengketa.']);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get(route('admin.sponsorships.index'))->assertOk();
        $this->actingAs($admin)->get(route('admin.sponsorships.show', $sponsorship))->assertOk();
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
