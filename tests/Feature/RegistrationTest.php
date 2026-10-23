<?php

namespace Tests\Feature;

use App\Enums\SponsorVerificationStatus;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_sponsor_registration_creates_organization_and_draft_verification(): void
    {
        $response = $this->post('/register', [
            'name' => 'Sari Wijaya',
            'email' => 'Sari@Example.com',
            'password' => 'passwordku123',
            'password_confirmation' => 'passwordku123',
            'role' => 'sponsor',
            'organization_name' => 'PT Sari Maju',
        ]);

        $response->assertRedirect(route('verification.notice'));

        $user = User::where('email', 'sari@example.com')->firstOrFail();
        $this->assertSame(UserRole::Sponsor, $user->role);
        $this->assertNotNull($user->organization);
        $this->assertSame(
            SponsorVerificationStatus::Draft,
            $user->organization->verification->status
        );
    }

    public function test_eo_registration_does_not_create_verification(): void
    {
        $this->post('/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => 'passwordku123',
            'password_confirmation' => 'passwordku123',
            'role' => 'eo',
            'organization_name' => 'Komunitas Budi',
        ])->assertRedirect(route('verification.notice'));

        $user = User::where('email', 'budi@example.com')->firstOrFail();
        $this->assertSame(UserRole::Eo, $user->role);
        $this->assertNull($user->organization->verification);
    }

    public function test_admin_role_cannot_be_self_registered(): void
    {
        $this->post('/register', [
            'name' => 'Penyusup',
            'email' => 'attacker@example.com',
            'password' => 'passwordku123',
            'password_confirmation' => 'passwordku123',
            'role' => 'admin',
            'organization_name' => 'Palsu',
        ])->assertSessionHasErrors('role');

        $this->assertDatabaseMissing('users', ['email' => 'attacker@example.com']);
    }
}
