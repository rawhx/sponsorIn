<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\SponsorshipPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    private function publishedEvent(array $attributes = []): Event
    {
        return Event::factory()->published()->create($attributes);
    }

    private function package(Event $event, ?float $price): SponsorshipPackage
    {
        return SponsorshipPackage::factory()->create([
            'event_id' => $event->id,
            'price_amount' => $price,
        ]);
    }

    public function test_price_range_filters_events_with_a_matching_package(): void
    {
        $cheap = $this->publishedEvent(['title' => 'Event Murah']);
        $this->package($cheap, 5_000_000);

        $mid = $this->publishedEvent(['title' => 'Event Menengah']);
        $this->package($mid, 20_000_000);

        $pricey = $this->publishedEvent(['title' => 'Event Mahal']);
        $this->package($pricey, 75_000_000);

        $this->get('/events?min_price=10000000&max_price=30000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('public/Events')
                ->has('events.data', 1)
                ->where('events.data.0.id', $mid->id)
            );
    }

    public function test_price_range_is_swapped_when_min_is_greater_than_max(): void
    {
        $event = $this->publishedEvent();
        $this->package($event, 20_000_000);

        $this->get('/events?min_price=30000000&max_price=10000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('events.data', 1)
                ->where('events.data.0.id', $event->id)
            );
    }

    public function test_events_without_priced_packages_are_excluded_when_a_range_is_active(): void
    {
        $priced = $this->publishedEvent();
        $this->package($priced, 10_000_000);

        $unpriced = $this->publishedEvent();
        $this->package($unpriced, null);

        $this->publishedEvent();

        $this->get('/events?min_price=1000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('events.data', 1)
                ->where('events.data.0.id', $priced->id)
            );
    }

    public function test_card_displays_the_cheapest_package_inside_the_active_range(): void
    {
        $event = $this->publishedEvent();
        $this->package($event, 5_000_000);
        $this->package($event, 15_000_000);
        $this->package($event, 40_000_000);

        $this->get('/events?min_price=10000000&max_price=50000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('events.data', 1)
                ->where('events.data.0.price_min', '15000000.00')
            );
    }

    public function test_city_filter_narrows_events_by_location(): void
    {
        $bandung = $this->publishedEvent(['location' => 'Kota Bandung']);
        $this->package($bandung, 10_000_000);
        $surabaya = $this->publishedEvent(['location' => 'Kota Surabaya']);
        $this->package($surabaya, 10_000_000);

        $this->get('/events?location='.urlencode('Bandung'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('events.data', 1)
                ->where('events.data.0.id', $bandung->id)
            );
    }

    public function test_sponsor_event_catalog_applies_the_price_and_city_filters(): void
    {
        $sponsor = $this->sponsorWithVerification();

        $match = $this->publishedEvent(['location' => 'Kota Bandung']);
        $this->package($match, 25_000_000);

        $wrongCity = $this->publishedEvent(['location' => 'Kota Surabaya']);
        $this->package($wrongCity, 25_000_000);

        $wrongPrice = $this->publishedEvent(['location' => 'Kota Bandung']);
        $this->package($wrongPrice, 50_000_000);

        $this->actingAs($sponsor)
            ->get('/sponsor/events?location='.urlencode('Bandung').'&min_price=10000000&max_price=30000000')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('sponsor/Events')
                ->has('events.data', 1)
                ->where('events.data.0.id', $match->id)
            );
    }

    public function test_filter_values_are_passed_back_to_the_form(): void
    {
        $this->get('/events?min_price=5000000&max_price=20000000&location=Bandung')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('filters.min_price', '5000000')
                ->where('filters.max_price', '20000000')
                ->where('filters.location', 'Bandung')
            );
    }
}
