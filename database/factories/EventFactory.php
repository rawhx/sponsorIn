<?php

namespace Database\Factories;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'eo_organization_id' => Organization::factory()->eo(),
            'title' => $title,
            'slug' => str()->slug($title).'-'.str()->random(6),
            'category' => 'lainnya',
            'format' => 'offline',
            'date_start' => now()->addDays(30)->toDateString(),
            'date_end' => now()->addDays(30)->toDateString(),
            'location' => fake()->city(),
            'description' => fake()->paragraph(),
            'status' => EventStatus::Draft,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'status' => EventStatus::Published,
            'published_at' => now(),
        ]);
    }
}
