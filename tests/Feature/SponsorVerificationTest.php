<?php

namespace Tests\Feature;

use App\Enums\SponsorVerificationStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SponsorVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_sponsor_can_save_draft_without_completing_fields(): void
    {
        $user = $this->sponsorWithVerification(SponsorVerificationStatus::Draft);

        $this->actingAs($user)
            ->put('/sponsor/verification', [
                'business_name' => 'PT Kopi Nusantara',
                'business_email' => 'halo@kopi.test',
            ])
            ->assertRedirect();

        $verification = $user->organization->verification->fresh();
        $this->assertSame(SponsorVerificationStatus::Draft, $verification->status);
    }

    public function test_submitting_requires_complete_data_and_document(): void
    {
        Storage::fake('local');
        $user = $this->sponsorWithVerification(SponsorVerificationStatus::Draft);

        $this->actingAs($user)
            ->put('/sponsor/verification', [
                'business_name' => 'PT Kopi Nusantara',
                'submit' => true,
            ])
            ->assertSessionHasErrors(['business_email', 'legal_form', 'nib', 'tax_id', 'supporting_document']);
    }

    public function test_sponsor_can_submit_complete_verification(): void
    {
        Storage::fake('local');
        $user = $this->sponsorWithVerification(SponsorVerificationStatus::Draft);

        $this->actingAs($user)
            ->put('/sponsor/verification', [
                'business_name' => 'PT Kopi Nusantara',
                'business_email' => 'halo@kopi.test',
                'legal_form' => 'pt',
                'nib' => '1234567890123',
                'tax_id' => '091234567890123',
                'supporting_document' => UploadedFile::fake()->create('akta.pdf', 100, 'application/pdf'),
                'submit' => true,
            ])
            ->assertRedirect();

        $verification = $user->organization->verification->fresh();
        $this->assertSame(SponsorVerificationStatus::Submitted, $verification->status);
        $this->assertNotNull($verification->submitted_at);
        $this->assertNotNull($verification->supporting_document_path);
        Storage::disk('local')->assertExists($verification->supporting_document_path);
    }

    public function test_approved_verification_is_not_editable(): void
    {
        $user = $this->sponsorWithVerification(SponsorVerificationStatus::Approved);

        $this->actingAs($user)
            ->put('/sponsor/verification', [
                'business_name' => 'Nama Baru',
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseMissing('sponsor_verifications', [
            'organization_id' => $user->organization->id,
            'status' => 'draft',
        ]);
    }
}
