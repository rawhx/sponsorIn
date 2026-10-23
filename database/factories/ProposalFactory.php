<?php

namespace Database\Factories;

use App\Enums\ProposalStatus;
use App\Enums\ProposalType;
use App\Models\Event;
use App\Models\Organization;
use App\Models\Proposal;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProposalFactory extends Factory
{
    protected $model = Proposal::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'sender_org_id' => Organization::factory()->sponsor(),
            'recipient_org_id' => Organization::factory()->eo(),
            'proposal_type' => ProposalType::SponsorToEo,
            'package_id' => null,
            'requested_support' => fake()->sentence(),
            'deliverables' => fake()->sentence(),
            'terms_summary' => fake()->sentence(),
            'status' => ProposalStatus::Draft,
            'valid_until' => now()->addDays(14)->toDateString(),
            'last_status_at' => now(),
        ];
    }
}
