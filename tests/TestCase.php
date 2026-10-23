<?php

namespace Tests;

use App\Enums\ProposalPreference;
use App\Enums\SponsorVerificationStatus;
use App\Models\Organization;
use App\Models\SponsorVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function sponsorWithVerification(SponsorVerificationStatus $status = SponsorVerificationStatus::Approved): User
    {
        $user = User::factory()->sponsor()->create();

        $organization = Organization::factory()->sponsor()->create([
            'owner_user_id' => $user->id,
            'proposal_preference' => ProposalPreference::Open,
        ]);

        SponsorVerification::create([
            'organization_id' => $organization->id,
            'status' => $status,
            'submitted_at' => $status === SponsorVerificationStatus::Draft ? null : now(),
        ]);

        return $user->fresh('organization.verification');
    }

    protected function eoWithOrganization(): User
    {
        $user = User::factory()->eo()->create();

        Organization::factory()->eo()->create([
            'owner_user_id' => $user->id,
        ]);

        return $user->fresh('organization');
    }

    protected function eoOrganization(array $attributes = []): Organization
    {
        $user = User::factory()->eo()->create();

        return Organization::factory()->eo()->create([
            'owner_user_id' => $user->id,
            ...$attributes,
        ]);
    }

    protected function sponsorOrganization(array $attributes = []): Organization
    {
        $user = User::factory()->sponsor()->create();

        return Organization::factory()->sponsor()->create([
            'owner_user_id' => $user->id,
            ...$attributes,
        ]);
    }

    protected function activeSponsorOrganization(array $attributes = []): Organization
    {
        $organization = $this->sponsorOrganization($attributes);

        SponsorVerification::create([
            'organization_id' => $organization->id,
            'status' => SponsorVerificationStatus::Approved,
            'submitted_at' => now(),
        ]);

        return $organization->fresh('owner', 'verification');
    }
}
