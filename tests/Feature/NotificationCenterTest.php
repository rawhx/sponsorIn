<?php

namespace Tests\Feature;

use App\Enums\ProposalStatus;
use App\Models\Event;
use App\Models\Proposal;
use App\Notifications\ProposalStatusNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_notification_center(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->sponsorOrganization();

        $proposal = Proposal::create([
            'event_id' => Event::factory()->create(['eo_organization_id' => $eo->id])->id,
            'sender_org_id' => $sponsor->id,
            'recipient_org_id' => $eo->id,
            'proposal_type' => 'sponsor_to_eo',
            'requested_support' => 'Dukungan.',
            'status' => ProposalStatus::Sent,
            'last_status_at' => now(),
        ]);

        $sponsor->owner->notify(new ProposalStatusNotification($proposal, ProposalStatus::Accepted));

        $this->actingAs($sponsor->owner)
            ->get('/notifications')
            ->assertOk();

        $this->assertSame(1, $sponsor->owner->fresh()->unreadNotifications()->count());
    }

    public function test_marking_all_notifications_read(): void
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->sponsorOrganization();
        $proposal = Proposal::create([
            'event_id' => Event::factory()->create(['eo_organization_id' => $eo->id])->id,
            'sender_org_id' => $sponsor->id,
            'recipient_org_id' => $eo->id,
            'proposal_type' => 'sponsor_to_eo',
            'requested_support' => 'Dukungan.',
            'status' => ProposalStatus::Sent,
            'last_status_at' => now(),
        ]);

        $sponsor->owner->notify(new ProposalStatusNotification($proposal, ProposalStatus::Accepted));

        $this->actingAs($sponsor->owner)
            ->post('/notifications/read-all')
            ->assertRedirect();

        $this->assertSame(0, $sponsor->owner->fresh()->unreadNotifications()->count());
    }

    public function test_guest_cannot_access_notifications(): void
    {
        $this->get('/notifications')->assertRedirect('/login');
    }
}
