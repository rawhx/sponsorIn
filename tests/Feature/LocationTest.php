<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_city_endpoint_proxies_region_data_without_browser_cors(): void
    {
        Cache::forget('indonesia-cities-v1');

        Http::fake([
            '*/provinces.json' => Http::response([
                'data' => [['id' => '31', 'name' => 'DKI JAKARTA']],
            ]),
            '*/regencies/31.json' => Http::response([
                'data' => [['id' => '3171', 'name' => 'KOTA JAKARTA SELATAN']],
            ]),
        ]);

        $this->getJson('/api/locations/cities')
            ->assertOk()
            ->assertJsonPath('data.0', 'KOTA JAKARTA SELATAN');
    }
}
