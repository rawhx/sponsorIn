<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class LocationController extends Controller
{
    public function cities(): JsonResponse
    {
        try {
            $cities = Cache::remember('indonesia-cities-v1', now()->addDay(), function () {
                $baseUrl = rtrim((string) config('services.indonesia_regions.url'), '/');
                $provinces = $this->items(Http::timeout(10)->get($baseUrl.'/provinces.json')->throw()->json());

                $responses = Http::pool(function (Pool $pool) use ($baseUrl, $provinces) {
                    return collect($provinces)->map(
                        fn (array $province) => $pool
                            ->as((string) ($province['code'] ?? $province['id']))
                            ->timeout(10)
                            ->get($baseUrl.'/regencies/'.($province['code'] ?? $province['id']).'.json')
                    )->all();
                });

                return collect($responses)
                    ->flatMap(fn ($response) => $this->items($response->throw()->json()))
                    ->filter(fn (array $city) => filled($city['name'] ?? null))
                    ->map(fn (array $city) => $city['name'])
                    ->unique()
                    ->sort()
                    ->values()
                    ->all();
            });

            return response()->json(['data' => $cities]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Daftar kota sedang tidak tersedia.',
            ], 503);
        }
    }

    private function items(array $payload): array
    {
        return isset($payload['data']) && is_array($payload['data'])
            ? $payload['data']
            : $payload;
    }
}
