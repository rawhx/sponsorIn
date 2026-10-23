<?php

namespace Database\Factories;

use App\Enums\ReviewStatus;
use App\Models\Review;
use App\Models\Sponsorship;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        $sponsorship = Sponsorship::factory()->create();

        return [
            'sponsorship_id' => $sponsorship->id,
            'eo_org_id' => $sponsorship->eo_org_id,
            'sponsor_org_id' => $sponsorship->sponsor_org_id,
            'overall_rating' => 5,
            'communication_rating' => 5,
            'professionalism_rating' => 5,
            'deliverables_rating' => 5,
            'comment' => fake()->sentence(),
            'status' => ReviewStatus::Published,
            'submitted_at' => now(),
            'published_at' => now(),
        ];
    }
}
