<?php

namespace Tests\Feature;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\Organization;
use App\Models\SponsorshipPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    private function publishedEvent(Organization $organization, array $attributes = []): Event
    {
        return Event::factory()->create([
            'eo_organization_id' => $organization->id,
            'status' => EventStatus::Published,
            'published_at' => now(),
            ...$attributes,
        ]);
    }

    private function packageFor(Event $event, ?int $price, string $currency = 'IDR'): SponsorshipPackage
    {
        return SponsorshipPackage::factory()->create([
            'event_id' => $event->id,
            'price_amount' => $price,
            'currency' => $currency,
        ]);
    }

    public function test_public_catalog_filters_events_by_price_range(): void
    {
        $organization = $this->eoOrganization();

        $matching = $this->publishedEvent($organization);
        $this->packageFor($matching, 10_000_000);

        $tooExpensive = $this->publishedEvent($organization);
        $this->packageFor($tooExpensive, 100_000_000);

        $this->get('/events?min_price=5000000&max_price=15000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/Events')
                ->has('events.data', 1)
                ->where('events.data.0.id', $matching->id)
                ->where('events.data.0.price_min', '10000000.00')
            );
    }

    public function test_price_range_is_swapped_when_minimum_exceeds_maximum(): void
    {
        $organization = $this->eoOrganization();

        $matching = $this->publishedEvent($organization);
        $this->packageFor($matching, 10_000_000);

        $this->get('/events?min_price=15000000&max_price=5000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/Events')
                ->has('events.data', 1)
                ->where('events.data.0.id', $matching->id)
            );
    }

    public function test_price_filter_excludes_events_without_a_price(): void
    {
        $organization = $this->eoOrganization();

        $negotiable = $this->publishedEvent($organization);
        $this->packageFor($negotiable, null);

        $priced = $this->publishedEvent($organization);
        $this->packageFor($priced, 10_000_000);

        $this->get('/events?min_price=1000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/Events')
                ->has('events.data', 1)
                ->where('events.data.0.id', $priced->id)
            );
    }

    public function test_displayed_starting_price_matches_the_active_price_range(): void
    {
        $organization = $this->eoOrganization();

        $event = $this->publishedEvent($organization);
        $this->packageFor($event, 5_000_000);
        $this->packageFor($event, 100_000_000);

        $this->get('/events?min_price=50000000&max_price=150000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/Events')
                ->has('events.data', 1)
                ->where('events.data.0.id', $event->id)
                ->where('events.data.0.price_min', '100000000.00')
            );
    }

    public function test_location_filter_only_returns_events_in_that_city(): void
    {
        $organization = $this->eoOrganization();

        $bandung = $this->publishedEvent($organization, ['location' => 'Bandung']);
        $this->publishedEvent($organization, ['location' => 'Yogyakarta']);

        $this->get('/events?location=Bandung')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('public/Events')
                ->has('events.data', 1)
                ->where('events.data.0.id', $bandung->id)
                ->where('filters.location', 'Bandung')
            );
    }

    public function test_sponsor_catalog_applies_price_and_location_filters(): void
    {
        $sponsor = $this->sponsorWithVerification();
        $organization = $this->eoOrganization();

        $matching = $this->publishedEvent($organization, ['location' => 'Bandung']);
        $this->packageFor($matching, 10_000_000);

        $otherCity = $this->publishedEvent($organization, ['location' => 'Surabaya']);
        $this->packageFor($otherCity, 10_000_000);

        $outsideBudget = $this->publishedEvent($organization, ['location' => 'Bandung']);
        $this->packageFor($outsideBudget, 80_000_000);

        $this->actingAs($sponsor)
            ->get('/sponsor/events?location=Bandung&min_price=5000000&max_price=15000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('sponsor/Events')
                ->has('events.data', 1)
                ->where('events.data.0.id', $matching->id)
                ->where('filters.min_price', '5000000')
                ->where('filters.max_price', '15000000')
                ->where('filters.location', 'Bandung')
            );
    }
}
