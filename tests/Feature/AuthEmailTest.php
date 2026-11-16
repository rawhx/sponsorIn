<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_does_not_send_any_email(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'login@example.com',
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
        Notification::assertNothingSent();
    }

    public function test_password_reset_still_sends_an_email(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'reset@example.com',
        ]);

        $this->post('/forgot-password', [
            'email' => $user->email,
        ])->assertSessionHas('success');

        Notification::assertSentTo($user, ResetPassword::class);
    }
}
