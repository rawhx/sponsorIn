<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Enums\SponsorVerificationStatus;
use App\Models\Event;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SponsorShortlistTest extends TestCase
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

    public function test_active_sponsor_can_shortlist_a_published_event(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Approved);
        $event = $this->publishedEvent($this->eoOrganization());

        $this->actingAs($sponsor)
            ->post("/sponsor/events/{$event->id}/shortlist")
            ->assertRedirect();

        $this->assertDatabaseHas('shortlists', [
            'organization_id' => $sponsor->organization->id,
            'event_id' => $event->id,
        ]);
    }

    public function test_shortlisting_is_idempotent(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Approved);
        $event = $this->publishedEvent($this->eoOrganization());

        $this->actingAs($sponsor)->post("/sponsor/events/{$event->id}/shortlist");
        $this->actingAs($sponsor)->post("/sponsor/events/{$event->id}/shortlist");

        $this->assertSame(1, $sponsor->organization->shortlists()->count());
    }

    public function test_sponsor_can_remove_from_shortlist(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Approved);
        $event = $this->publishedEvent($this->eoOrganization());

        $panel = $this->actingAs($sponsor);
        $panel->post("/sponsor/events/{$event->id}/shortlist");
        $panel->delete("/sponsor/events/{$event->id}/shortlist");

        $this->assertSame(0, $sponsor->organization->shortlists()->count());
    }

    public function test_unverified_sponsor_cannot_shortlist(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $event = $this->publishedEvent($this->eoOrganization());

        $this->actingAs($sponsor)
            ->post("/sponsor/events/{$event->id}/shortlist")
            ->assertRedirect(route('sponsor.verification.show'))
            ->assertSessionHas('error', 'Fitur sponsor aktif tersedia setelah verifikasi usaha disetujui.');
    }

    public function test_cannot_shortlist_a_draft_event(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Approved);
        $event = Event::factory()->create([
            'eo_organization_id' => $this->eoOrganization()->id,
            'status' => EventStatus::Draft,
        ]);

        $this->actingAs($sponsor)
            ->post("/sponsor/events/{$event->id}/shortlist")
            ->assertNotFound();
    }

    public function test_shortlist_page_lists_only_published_events(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Approved);
        $organization = $this->eoOrganization();

        $published = $this->publishedEvent($organization);
        $draft = Event::factory()->create([
            'eo_organization_id' => $organization->id,
            'status' => EventStatus::Draft,
        ]);

        $sponsor->organization->shortlists()->create(['event_id' => $published->id]);
        $sponsor->organization->shortlists()->create(['event_id' => $draft->id]);

        $this->actingAs($sponsor)
            ->get('/sponsor/shortlist')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('sponsor/Shortlist')->has('events.data', 1));
    }

    public function test_event_detail_marks_shortlisted_state(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Approved);
        $event = $this->publishedEvent($this->eoOrganization());
        $sponsor->organization->shortlists()->create(['event_id' => $event->id]);

        $this->actingAs($sponsor)
            ->get("/events/{$event->slug}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/EventShow')->where('event.shortlisted', true));
    }

    public function test_public_organizer_profile_lists_published_events(): void
    {
        $organization = $this->eoOrganization();
        $this->publishedEvent($organization);
        Event::factory()->create([
            'eo_organization_id' => $organization->id,
            'status' => EventStatus::Draft,
        ]);

        $this->get("/organizers/{$organization->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/OrganizerShow')
                ->where('organizer.event_count', 1)
                ->has('events', 1)
            );
    }

    public function test_organizer_profile_requires_at_least_one_published_event(): void
    {
        $organization = $this->eoOrganization();

        $this->get("/organizers/{$organization->id}")->assertNotFound();
    }

    public function test_sponsor_organization_cannot_have_public_profile(): void
    {
        $organization = $this->sponsorOrganization();

        $this->get("/organizers/{$organization->id}")->assertNotFound();
    }

    public function test_organizer_directory_only_lists_eo_with_published_events(): void
    {
        $eoWithEvent = $this->eoOrganization();
        $this->publishedEvent($eoWithEvent);

        $eoWithoutEvent = $this->eoOrganization();
        $sponsorOrg = $this->sponsorOrganization();

        $this->get('/organizers')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/Organizers')
                ->has('organizers.data', 1)
                ->where('organizers.data.0.id', $eoWithEvent->id)
            );
    }
}
