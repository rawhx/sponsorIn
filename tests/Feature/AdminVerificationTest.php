<?php

namespace Tests\Feature;

use App\Enums\SponsorVerificationStatus;
use App\Models\SponsorVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_approve_a_submitted_verification(): void
    {
        $admin = User::factory()->admin()->create();
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $verification = $sponsor->organization->verification;

        $this->actingAs($admin)
            ->post("/admin/verifications/{$verification->id}/decision", [
                'decision' => 'approved',
                'reason_public' => 'Data sesuai.',
            ])
            ->assertRedirect(route('admin.verifications.show', $verification));

        $verification->refresh();
        $this->assertSame(SponsorVerificationStatus::Approved, $verification->status);
        $this->assertSame($admin->id, $verification->reviewed_by);
        $this->assertNotNull($verification->reviewed_at);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'sponsor_verification.approved',
            'entity_type' => SponsorVerification::class,
            'entity_id' => $verification->id,
        ]);
    }

    public function test_requesting_information_requires_public_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $verification = $sponsor->organization->verification;

        $this->actingAs($admin)
            ->post("/admin/verifications/{$verification->id}/decision", [
                'decision' => 'needs_information',
            ])
            ->assertSessionHasErrors('reason_public');

        $this->assertSame(
            SponsorVerificationStatus::Submitted,
            $verification->fresh()->status
        );
    }

    public function test_sponsor_cannot_decide_on_verifications(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $verification = $sponsor->organization->verification;

        $this->actingAs($sponsor)
            ->post("/admin/verifications/{$verification->id}/decision", [
                'decision' => 'approved',
            ])
            ->assertForbidden();
    }

    public function test_approval_activates_sponsor_access_through_queue(): void
    {
        $admin = User::factory()->admin()->create();
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $this->assertFalse($sponsor->hasActiveSponsorAccess());

        $this->actingAs($admin)
            ->post("/admin/verifications/{$sponsor->organization->verification->id}/decision", [
                'decision' => 'approved',
                'reason_public' => 'Disetujui.',
            ]);

        $this->assertTrue($sponsor->fresh()->hasActiveSponsorAccess());
    }
}
