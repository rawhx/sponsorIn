<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\ProposalPreference;
use App\Enums\ProposalStatus;
use App\Models\Conversation;
use App\Models\Event;
use App\Models\Message;
use App\Models\Organization;
use App\Models\Proposal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProposalLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private function publishedEvent(Organization $organization): Event
    {
        return Event::factory()->create([
            'eo_organization_id' => $organization->id,
            'status' => EventStatus::Published,
            'published_at' => now(),
        ]);
    }

    private function sponsorToEoProposal(Organization $eo, Organization $sponsor): Proposal
    {
        $event = $this->publishedEvent($eo);

        return Proposal::create([
            'event_id' => $event->id,
            'sender_org_id' => $sponsor->id,
            'recipient_org_id' => $eo->id,
            'proposal_type' => 'sponsor_to_eo',
            'requested_support' => 'Dukungan dana untuk panggung utama.',
            'status' => ProposalStatus::Sent,
            'last_status_at' => now(),
        ]);
    }

    public function test_active_sponsor_can_send_proposal_to_event(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->activeSponsorOrganization();
        $event = $this->publishedEvent($eo);
        $owner = $sponsor->owner;

        $this->actingAs($owner)
            ->post("/sponsor/events/{$event->id}/proposals", [
                'requested_support' => 'Dukungan dana untuk panggung utama.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('proposals', [
            'event_id' => $event->id,
            'sender_org_id' => $sponsor->id,
            'recipient_org_id' => $eo->id,
            'status' => ProposalStatus::Sent->value,
        ]);

        $this->assertDatabaseCount('conversations', 1);
    }

    public function test_proposal_creation_is_blocked_without_active_sponsor_access(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->sponsorOrganization();
        $event = $this->publishedEvent($eo);

        $this->actingAs($sponsor->owner)
            ->post("/sponsor/events/{$event->id}/proposals", [
                'requested_support' => 'Dukungan.',
            ])
            ->assertForbidden();
    }

    public function test_eo_can_create_proposal_to_receptive_sponsor(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->sponsorOrganization(['proposal_preference' => ProposalPreference::Open]);
        $event = $this->publishedEvent($eo);

        $this->actingAs($eo->owner)
            ->post('/eo/proposals', [
                'event_id' => $event->id,
                'sponsor_org_id' => $sponsor->id,
                'requested_support' => 'Kami mengundang Anda sebagai sponsor utama.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('proposals', [
            'sender_org_id' => $eo->id,
            'recipient_org_id' => $sponsor->id,
            'proposal_type' => 'eo_to_sponsor',
        ]);
    }

    public function test_eo_cannot_propose_to_closed_sponsor(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->sponsorOrganization(['proposal_preference' => ProposalPreference::Closed]);
        $event = $this->publishedEvent($eo);

        $this->actingAs($eo->owner)
            ->post('/eo/proposals', [
                'event_id' => $event->id,
                'sponsor_org_id' => $sponsor->id,
                'requested_support' => 'Undangan.',
            ])
            ->assertStatus(422);
    }

    public function test_recipient_can_accept_proposal(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->sponsorOrganization();
        $proposal = $this->sponsorToEoProposal($eo, $sponsor);

        $this->actingAs($eo->owner)
            ->post("/eo/proposals/{$proposal->id}/transition", ['status' => 'accepted'])
            ->assertRedirect();

        $this->assertEquals(ProposalStatus::Accepted, $proposal->fresh()->status);
        $this->assertNotNull($proposal->fresh()->eo_confirmed_at);
    }

    public function test_sender_cannot_accept_own_proposal(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->sponsorOrganization(['proposal_preference' => ProposalPreference::Open]);
        $event = $this->publishedEvent($eo);

        $proposal = Proposal::create([
            'event_id' => $event->id,
            'sender_org_id' => $eo->id,
            'recipient_org_id' => $sponsor->id,
            'proposal_type' => 'eo_to_sponsor',
            'requested_support' => 'Undangan sponsorship.',
            'status' => ProposalStatus::Sent,
            'last_status_at' => now(),
        ]);

        $this->actingAs($eo->owner)
            ->post("/eo/proposals/{$proposal->id}/transition", ['status' => 'accepted'])
            ->assertStatus(422);
    }

    public function test_non_party_cannot_view_proposal(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->sponsorOrganization();
        $proposal = $this->sponsorToEoProposal($eo, $sponsor);
        $stranger = $this->eoOrganization();

        $this->actingAs($stranger->owner)
            ->get("/eo/proposals/{$proposal->id}")
            ->assertForbidden();
    }

    public function test_party_can_exchange_messages(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->activeSponsorOrganization();
        $proposal = $this->sponsorToEoProposal($eo, $sponsor);

        Conversation::create([
            'proposal_id' => $proposal->id,
            'participant_org_ids' => [$eo->id, $sponsor->id],
        ]);

        $this->actingAs($sponsor->owner)
            ->post("/sponsor/proposals/{$proposal->id}/messages", ['body' => 'Halo, ada kabar?'])
            ->assertRedirect();

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $proposal->conversation->id,
            'sender_user_id' => $sponsor->owner->id,
            'body' => 'Halo, ada kabar?',
        ]);

        $this->actingAs($eo->owner)
            ->post("/eo/proposals/{$proposal->id}/messages", ['body' => 'Baik, kami tinjau.'])
            ->assertRedirect();

        $this->assertSame(2, Message::count());
    }

    public function test_posting_message_marks_counterpart_messages_read(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->activeSponsorOrganization();
        $proposal = $this->sponsorToEoProposal($eo, $sponsor);

        Conversation::create([
            'proposal_id' => $proposal->id,
            'participant_org_ids' => [$eo->id, $sponsor->id],
        ]);

        $this->actingAs($sponsor->owner)
            ->post("/sponsor/proposals/{$proposal->id}/messages", ['body' => 'Pesan pertama.']);

        $this->actingAs($eo->owner)
            ->post("/eo/proposals/{$proposal->id}/messages", ['body' => 'Balasan.']);

        $this->assertNotNull(
            Message::where('sender_user_id', $sponsor->owner->id)->first()->read_at
        );
    }

    public function test_proposal_status_change_notifies_counterpart(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->sponsorOrganization();
        $proposal = $this->sponsorToEoProposal($eo, $sponsor);

        $this->actingAs($eo->owner)
            ->post("/eo/proposals/{$proposal->id}/transition", ['status' => 'accepted']);

        $this->assertSame(1, $sponsor->owner->fresh()->notifications()->count());
    }
}
