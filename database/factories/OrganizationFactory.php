<?php

namespace Database\Factories;

use App\Enums\OrganizationType;
use App\Enums\ProposalPreference;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        $name = fake()->company();

        return [
            'owner_user_id' => User::factory(),
            'type' => OrganizationType::Sponsor,
            'legal_name' => $name,
            'display_name' => $name,
            'description' => fake()->sentence(),
            'location' => fake()->city(),
            'public_visibility' => true,
            'proposal_preference' => ProposalPreference::Open,
        ];
    }

    public function sponsor(): static
    {
        return $this->state(fn () => ['type' => OrganizationType::Sponsor]);
    }

    public function eo(): static
    {
        return $this->state(fn () => ['type' => OrganizationType::Eo]);
    }
}
