<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login_from_dashboards(): void
    {
        $this->get('/sponsor/dashboard')->assertRedirect('/login');
        $this->get('/eo/dashboard')->assertRedirect('/login');
        $this->get('/admin/dashboard')->assertRedirect('/login');
    }

    public function test_verified_sponsor_can_open_sponsor_dashboard(): void
    {
        $user = $this->sponsorWithVerification();

        $this->actingAs($user)
            ->get('/sponsor/dashboard')
            ->assertOk();
    }

    public function test_sponsor_cannot_open_admin_area(): void
    {
        $user = $this->sponsorWithVerification();

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertForbidden();
    }

    public function test_eo_cannot_open_sponsor_area(): void
    {
        $user = $this->eoWithOrganization();

        $this->actingAs($user)
            ->get('/sponsor/dashboard')
            ->assertForbidden();
    }

    public function test_dashboard_redirects_by_role(): void
    {
        $this->actingAs($this->sponsorWithVerification())
            ->get('/dashboard')
            ->assertRedirect(route('sponsor.dashboard'));

        $this->actingAs($this->eoWithOrganization())
            ->get('/dashboard')
            ->assertRedirect(route('eo.dashboard'));
    }

    public function test_eo_can_open_profile(): void
    {
        $this->actingAs($this->eoWithOrganization())
            ->get('/eo/profile')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('eo/Profile')
                ->has('organization')
                ->where('eventsCount', 0)
            );
    }
}
