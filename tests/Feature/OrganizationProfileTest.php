<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\ProposalPreference;
use App\Enums\SponsorVerificationStatus;
use App\Models\Event;
use App\Models\Organization;
use App\Models\SponsorVerification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationProfileTest extends TestCase
{
    use RefreshDatabase;

    private function eoPayload(array $overrides = []): array
    {
        return array_merge([
            'display_name' => 'Ruang Temu Kreatif',
            'description' => 'Penyelenggara festival komunitas.',
            'portfolio' => 'Festival A (2.000 pengunjung, 2025); Pameran B (500 pengunjung, 2026).',
            'location' => 'Bandung',
            'category' => 'Musik',
            'public_contact' => 'halo@ruangtemu.test',
            'public_visibility' => true,
        ], $overrides);
    }

    public function test_eo_can_edit_public_profile_including_portfolio(): void
    {
        $eo = $this->eoOrganization();

        $this->actingAs($eo->owner)->get('/eo/profile')->assertOk();
        $this->actingAs($eo->owner)->put('/eo/profile', $this->eoPayload())->assertRedirect();

        $eo->refresh();
        $this->assertSame('Ruang Temu Kreatif', $eo->display_name);
        $this->assertSame('Musik', $eo->category);
        $this->assertStringContainsString('Festival A', $eo->portfolio);
        $this->assertSame('halo@ruangtemu.test', $eo->public_contact);
    }

    public function test_eo_profile_validates_input_and_cannot_change_legal_name_or_rating(): void
    {
        $eo = $this->eoOrganization(['legal_name' => 'PT Legal Asli', 'review_count' => 3, 'rating_average' => 4.5]);

        $this->actingAs($eo->owner)->put('/eo/profile', $this->eoPayload(['display_name' => '']))
            ->assertSessionHasErrors('display_name');
        $this->actingAs($eo->owner)->put('/eo/profile', $this->eoPayload(['portfolio' => str_repeat('a', 3001)]))
            ->assertSessionHasErrors('portfolio');

        // Mass-assignment: rating, nama legal, dan tipe tidak boleh bisa diubah lewat form.
        $this->actingAs($eo->owner)->put('/eo/profile', $this->eoPayload([
            'legal_name' => 'Diubah', 'rating_average' => 1.0, 'review_count' => 99, 'type' => 'sponsor',
        ]))->assertRedirect();

        $eo->refresh();
        $this->assertSame('PT Legal Asli', $eo->legal_name);
        $this->assertEquals(4.5, (float) $eo->rating_average);
        $this->assertSame(3, $eo->review_count);
        $this->assertTrue($eo->isEo());
    }

    public function test_only_eo_can_open_eo_profile(): void
    {
        $sponsor = $this->activeSponsorOrganization();

        $this->actingAs($sponsor->owner)->get('/eo/profile')->assertForbidden();
        $this->actingAs($sponsor->owner)->put('/eo/profile', $this->eoPayload())->assertForbidden();
    }

    public function test_guest_is_redirected_from_profile_pages(): void
    {
        $this->get('/eo/profile')->assertRedirect('/login');
        $this->get('/sponsor/organizations')->assertRedirect('/login');
    }

    public function test_public_organizer_page_shows_portfolio_and_hides_when_not_visible(): void
    {
        $eo = $this->eoOrganization(['portfolio' => 'Portofolio unik XYZ123', 'display_name' => 'Penyelenggara Uji QWE']);
        Event::factory()->create(['eo_organization_id' => $eo->id, 'status' => EventStatus::Published, 'published_at' => now()]);

        $this->get("/organizers/{$eo->id}")->assertOk()->assertSee('Portofolio unik XYZ123', false);

        $this->actingAs($eo->owner)->put('/eo/profile', $this->eoPayload([
            'display_name' => 'Penyelenggara Uji QWE', 'public_visibility' => false,
        ]))->assertRedirect();

        // Cek sebagai tamu: nama EO juga muncul di props bersama saat EO sendiri login.
        \Illuminate\Support\Facades\Auth::forgetGuards();
        $this->flushSession();

        $this->get('/organizers')->assertOk()->assertDontSee('Penyelenggara Uji QWE');
        $this->get("/organizers/{$eo->id}")->assertNotFound();
    }

    public function test_active_sponsor_can_update_profile_and_proposal_preference(): void
    {
        $sponsor = $this->activeSponsorOrganization(['legal_name' => 'PT Legal Sponsor']);

        $this->actingAs($sponsor->owner)->get('/sponsor/organizations')->assertOk();
        $this->actingAs($sponsor->owner)->put('/sponsor/organizations', [
            'display_name' => 'Brand Kopi Nusantara',
            'description' => 'Brand minuman lokal.',
            'location' => 'Surabaya',
            'category' => 'F&B',
            'public_contact' => 'csr@kopi.test',
            'public_visibility' => true,
            'proposal_preference' => 'selective',
            'legal_name' => 'Dicoba ubah',
        ])->assertRedirect();

        $sponsor->refresh();
        $this->assertSame('Brand Kopi Nusantara', $sponsor->display_name);
        $this->assertSame(ProposalPreference::Selective, $sponsor->proposal_preference);
        $this->assertSame('PT Legal Sponsor', $sponsor->legal_name);
    }

    public function test_sponsor_profile_rejects_invalid_preference(): void
    {
        $sponsor = $this->activeSponsorOrganization();

        $this->actingAs($sponsor->owner)->put('/sponsor/organizations', [
            'display_name' => 'X', 'public_visibility' => true, 'proposal_preference' => 'sembarang',
        ])->assertSessionHasErrors('proposal_preference');
    }

    public function test_pending_sponsor_cannot_use_organization_settings(): void
    {
        $pending = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);

        $this->actingAs($pending)->get('/sponsor/organizations')->assertForbidden();
        $this->actingAs($pending)->put('/sponsor/organizations', [
            'display_name' => 'X', 'public_visibility' => true, 'proposal_preference' => 'open',
        ])->assertForbidden();
    }

    public function test_sponsor_profile_page_never_exposes_verification_data(): void
    {
        $sponsor = $this->activeSponsorOrganization();
        SponsorVerification::where('organization_id', $sponsor->id)->update([]);
        $verification = $sponsor->verification;
        $verification->forceFill(['nib' => '1234567890123', 'tax_id' => '99.888.777.6-543.000'])->save();

        $html = $this->actingAs($sponsor->owner)->get('/sponsor/organizations')->assertOk()->getContent();

        $this->assertStringNotContainsString('1234567890123', $html);
        $this->assertStringNotContainsString('99.888.777.6-543.000', $html);
    }

    public function test_closing_proposals_blocks_new_eo_proposals(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->activeSponsorOrganization();
        $event = Event::factory()->create(['eo_organization_id' => $eo->id, 'status' => EventStatus::Published, 'published_at' => now()]);
        $payload = ['event_id' => $event->id, 'sponsor_org_id' => $sponsor->id, 'requested_support' => 'Dana 5 juta.'];

        $this->actingAs($sponsor->owner)->put('/sponsor/organizations', [
            'display_name' => $sponsor->display_name, 'public_visibility' => true, 'proposal_preference' => 'closed',
        ])->assertRedirect();

        $this->actingAs($eo->owner)->post('/eo/proposals', $payload)->assertStatus(422);
        $this->assertDatabaseCount('proposals', 0);

        $this->actingAs($sponsor->owner)->put('/sponsor/organizations', [
            'display_name' => $sponsor->display_name, 'public_visibility' => true, 'proposal_preference' => 'open',
        ]);
        $this->actingAs($eo->owner)->post('/eo/proposals', $payload)->assertRedirect();
        $this->assertDatabaseCount('proposals', 1);
    }

    public function test_hidden_sponsor_profile_is_not_listed_and_cannot_receive_eo_proposals(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->activeSponsorOrganization(['display_name' => 'Sponsor Tersembunyi QWE']);
        $event = Event::factory()->create(['eo_organization_id' => $eo->id, 'status' => EventStatus::Published, 'published_at' => now()]);

        $this->actingAs($sponsor->owner)->put('/sponsor/organizations', [
            'display_name' => 'Sponsor Tersembunyi QWE', 'public_visibility' => false, 'proposal_preference' => 'open',
        ])->assertRedirect();

        $this->actingAs($eo->owner)->get('/eo/proposals/create')->assertOk()->assertDontSee('Sponsor Tersembunyi QWE');
        $this->actingAs($eo->owner)->post('/eo/proposals', [
            'event_id' => $event->id, 'sponsor_org_id' => $sponsor->id, 'requested_support' => 'Dana.',
        ])->assertStatus(422);
        $this->assertDatabaseCount('proposals', 0);
    }
}
