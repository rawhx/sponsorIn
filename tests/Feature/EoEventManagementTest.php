<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\SupportType;
use App\Models\Event;
use App\Models\User;
use App\Notifications\EventModerationDecisionNotification;
use App\Notifications\NewEventReviewNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EoEventManagementTest extends TestCase
{
    use RefreshDatabase;

    private function eventFor(User $eo, array $attributes = []): Event
    {
        return Event::factory()->create([
            'eo_organization_id' => $eo->organization->id,
            ...$attributes,
        ]);
    }

    public function test_eo_can_create_a_draft_event(): void
    {
        $eo = $this->eoWithOrganization();

        $this->actingAs($eo)
            ->post('/eo/events', [
                'title' => 'Festival Kopi Nusantara',
                'category' => 'Kuliner',
                'format' => 'Offline',
                'date_start' => now()->addMonth()->toDateString(),
                'location' => 'Bandung',
                'description' => 'Festival kopi dengan puluhan tenant lokal.',
            ])
            ->assertRedirect();

        $event = Event::firstWhere('title', 'Festival Kopi Nusantara');
        $this->assertNotNull($event);
        $this->assertSame(EventStatus::Draft, $event->status);
        $this->assertSame($eo->organization->id, $event->eo_organization_id);
    }

    public function test_eo_cannot_view_another_organizers_event(): void
    {
        $owner = $this->eoWithOrganization();
        $intruder = $this->eoWithOrganization();
        $event = $this->eventFor($owner);

        $this->actingAs($intruder)
            ->get("/eo/events/{$event->id}")
            ->assertForbidden();
    }

    public function test_eo_can_add_and_update_audience_evidence(): void
    {
        $eo = $this->eoWithOrganization();
        $event = $this->eventFor($eo);

        $this->actingAs($eo)
            ->post("/eo/events/{$event->id}/evidence", [
                'evidence_type' => 'registration',
                'value' => 1200,
                'unit' => 'orang',
                'period' => 'Januari 2026',
                'source_description' => 'Laporan internal panitia',
            ])
            ->assertRedirect();

        $evidence = $event->audienceEvidence()->first();
        $this->assertNotNull($evidence);
        $this->assertSame('1200.00', $evidence->value);
        $this->assertSame('declared', $evidence->verification_status->value);

        $this->actingAs($eo)
            ->put("/eo/events/{$event->id}/evidence/{$evidence->id}", [
                'evidence_type' => 'check_in',
                'value' => 980,
                'unit' => 'orang',
                'period' => 'Januari 2026',
                'source_description' => 'Scan QR check-in',
            ])
            ->assertRedirect();

        $this->assertSame('check_in', $evidence->fresh()->evidence_type->value);
    }

    public function test_eo_can_add_package_with_benefits_and_deliverables(): void
    {
        $eo = $this->eoWithOrganization();
        $event = $this->eventFor($eo);

        $this->actingAs($eo)
            ->post("/eo/events/{$event->id}/packages", [
                'name' => 'Sponsor Utama',
                'support_type' => 'cash',
                'price_amount' => 50000000,
                'currency' => 'IDR',
                'benefits' => ['Logo di panggung utama', 'Sebutan brand'],
                'deliverables' => ['Booth 3x3 m'],
                'availability_status' => 'available',
            ])
            ->assertRedirect();

        $package = $event->packages()->first();
        $this->assertNotNull($package);
        $this->assertSame(SupportType::Cash, $package->support_type);
        $this->assertCount(2, $package->benefits);
        $this->assertCount(1, $package->deliverables);
    }

    public function test_submitting_for_review_requires_evidence(): void
    {
        Notification::fake();

        $eo = $this->eoWithOrganization();
        $event = $this->eventFor($eo);

        $this->actingAs($eo)
            ->post("/eo/events/{$event->id}/submit")
            ->assertSessionHas('error');

        $this->assertSame(EventStatus::Draft, $event->fresh()->status);
    }

    public function test_submitting_for_review_notifies_staff(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $eo = $this->eoWithOrganization();
        $event = $this->eventFor($eo);
        $event->audienceEvidence()->create([
            'evidence_type' => 'projection',
            'value' => 500,
            'unit' => 'orang',
            'period' => 'Perencanaan',
            'source_description' => 'Estimasi panitia',
        ]);

        $this->actingAs($eo)
            ->post("/eo/events/{$event->id}/submit")
            ->assertRedirect(route('eo.events.show', $event));

        $this->assertSame(EventStatus::UnderReview, $event->fresh()->status);
        Notification::assertSentTo($admin, NewEventReviewNotification::class);
    }

    public function test_eo_cannot_edit_event_under_review(): void
    {
        $eo = $this->eoWithOrganization();
        $event = $this->eventFor($eo, ['status' => EventStatus::UnderReview]);

        $this->actingAs($eo)
            ->get("/eo/events/{$event->id}/edit")
            ->assertForbidden();

        $this->actingAs($eo)
            ->put("/eo/events/{$event->id}", [
                'title' => 'Percobaan ubah',
                'category' => 'Kuliner',
                'format' => 'Offline',
                'date_start' => now()->addMonth()->toDateString(),
                'location' => 'Bandung',
                'description' => 'Deskripsi baru.',
            ])
            ->assertForbidden();
    }

    public function test_admin_can_publish_event_and_notifies_owner(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $eo = $this->eoWithOrganization();
        $event = $this->eventFor($eo, ['status' => EventStatus::UnderReview]);

        $this->actingAs($admin)
            ->post("/admin/events/{$event->id}/decision", [
                'decision' => 'approved',
                'reason_public' => 'Konten layak tampil.',
            ])
            ->assertRedirect(route('admin.events.show', $event));

        $event->refresh();
        $this->assertSame(EventStatus::Published, $event->status);
        $this->assertNotNull($event->published_at);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'event.approved',
            'entity_type' => Event::class,
            'entity_id' => $event->id,
        ]);

        Notification::assertSentTo($eo, EventModerationDecisionNotification::class);
    }

    public function test_needs_changes_requires_public_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $eo = $this->eoWithOrganization();
        $event = $this->eventFor($eo, ['status' => EventStatus::UnderReview]);

        $this->actingAs($admin)
            ->post("/admin/events/{$event->id}/decision", [
                'decision' => 'needs_changes',
            ])
            ->assertSessionHasErrors('reason_public');

        $this->assertSame(EventStatus::UnderReview, $event->fresh()->status);
    }

    public function test_sponsor_cannot_access_event_moderation(): void
    {
        $sponsor = $this->sponsorWithVerification();
        $eo = $this->eoWithOrganization();
        $event = $this->eventFor($eo);

        $this->actingAs($sponsor)
            ->get('/admin/events')
            ->assertForbidden();

        $this->actingAs($sponsor)
            ->post("/admin/events/{$event->id}/decision", ['decision' => 'approved'])
            ->assertForbidden();
    }

    public function test_published_event_appears_on_public_listing(): void
    {
        $eo = $this->eoWithOrganization();
        $this->eventFor($eo, ['status' => EventStatus::Published]);

        $this->get('/events')->assertOk()->assertInertia(
            fn ($page) => $page->component('public/Events')
                ->has('events.data', 1)
        );
    }

    public function test_eo_can_close_published_event(): void
    {
        $eo = $this->eoWithOrganization();
        $event = $this->eventFor($eo, ['status' => EventStatus::Published, 'published_at' => now()]);

        $this->actingAs($eo)
            ->post("/eo/events/{$event->id}/close")
            ->assertRedirect(route('eo.events.show', $event));

        $this->assertSame(EventStatus::Closed, $event->fresh()->status);
    }
}
