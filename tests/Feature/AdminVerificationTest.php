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

    public function test_draft_verification_cannot_be_approved_directly(): void
    {
        $admin = User::factory()->admin()->create();
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Draft);
        $verification = $sponsor->organization->verification;

        $this->actingAs($admin)
            ->post("/admin/verifications/{$verification->id}/decision", [
                'decision' => 'approved',
                'reason_public' => 'Coba lompati pengajuan.',
            ])
            ->assertSessionHasErrors('decision');

        $this->assertSame(SponsorVerificationStatus::Draft, $verification->fresh()->status);
        $this->assertFalse($sponsor->fresh()->hasActiveSponsorAccess());
    }

    public function test_approving_without_public_reason_does_not_crash(): void
    {
        $admin = User::factory()->admin()->create();
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $verification = $sponsor->organization->verification;

        $this->actingAs($admin)
            ->post("/admin/verifications/{$verification->id}/decision", ['decision' => 'approved'])
            ->assertRedirect(route('admin.verifications.show', $verification));

        $this->assertSame(SponsorVerificationStatus::Approved, $verification->fresh()->status);
    }

    public function test_verifier_can_mark_under_review_then_decide(): void
    {
        $verifier = User::factory()->create(['role' => 'verifier']);
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $verification = $sponsor->organization->verification;

        $this->actingAs($verifier)
            ->post("/admin/verifications/{$verification->id}/decision", ['decision' => 'under_review'])
            ->assertRedirect();
        $this->assertSame(SponsorVerificationStatus::UnderReview, $verification->fresh()->status);
        $this->assertDatabaseHas('audit_logs', ['action' => 'sponsor_verification.under_review', 'entity_id' => $verification->id]);

        $this->actingAs($verifier)
            ->post("/admin/verifications/{$verification->id}/decision", ['decision' => 'rejected', 'reason_public' => 'Dokumen tidak sesuai.'])
            ->assertRedirect();
        $this->assertSame(SponsorVerificationStatus::Rejected, $verification->fresh()->status);
    }

    public function test_admin_can_suspend_approved_sponsor_and_access_is_revoked(): void
    {
        $admin = User::factory()->admin()->create();
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Approved);
        $verification = $sponsor->organization->verification;
        $this->assertTrue($sponsor->hasActiveSponsorAccess());

        $this->actingAs($admin)
            ->post("/admin/verifications/{$verification->id}/decision", ['decision' => 'suspended'])
            ->assertSessionHasErrors('reason_public');

        $this->actingAs($admin)
            ->post("/admin/verifications/{$verification->id}/decision", [
                'decision' => 'suspended',
                'reason_public' => 'Ditemukan ketidaksesuaian dokumen.',
                'reason_internal' => 'Laporan pengguna #12.',
            ])
            ->assertRedirect();

        $this->assertSame(SponsorVerificationStatus::Suspended, $verification->fresh()->status);
        $this->assertFalse($sponsor->fresh()->hasActiveSponsorAccess());
        $this->assertDatabaseHas('audit_logs', ['action' => 'sponsor_verification.suspended', 'entity_id' => $verification->id]);

        // Dapat diaktifkan kembali.
        $this->actingAs($admin)
            ->post("/admin/verifications/{$verification->id}/decision", ['decision' => 'approved'])
            ->assertRedirect();
        $this->assertTrue($sponsor->fresh()->hasActiveSponsorAccess());
    }

    public function test_rejected_verification_cannot_be_flipped_to_approved_by_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Rejected);
        $verification = $sponsor->organization->verification;

        $this->actingAs($admin)
            ->post("/admin/verifications/{$verification->id}/decision", ['decision' => 'approved'])
            ->assertSessionHasErrors('decision');

        $this->assertSame(SponsorVerificationStatus::Rejected, $verification->fresh()->status);
    }
}
