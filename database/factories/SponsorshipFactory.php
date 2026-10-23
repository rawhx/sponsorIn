<?php

namespace Database\Factories;

use App\Enums\SponsorshipStatus;
use App\Models\Event;
use App\Models\Organization;
use App\Models\Proposal;
use App\Models\Sponsorship;
use Illuminate\Database\Eloquent\Factories\Factory;

class SponsorshipFactory extends Factory
{
    protected $model = Sponsorship::class;

    public function definition(): array
    {
        return [
            'proposal_id' => Proposal::factory(),
            'sponsor_org_id' => Organization::factory()->sponsor(),
            'eo_org_id' => Organization::factory()->eo(),
            'event_id' => Event::factory(),
            'agreed_terms' => fake()->sentence(),
            'deliverables' => fake()->sentence(),
            'status' => SponsorshipStatus::Active,
            'accepted_at' => now(),
        ];
    }
}
