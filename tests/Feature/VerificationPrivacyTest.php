<?php

namespace Tests\Feature;

use App\Enums\SponsorVerificationStatus;
use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerificationPrivacyTest extends TestCase
{
    use RefreshDatabase;

    public function test_sponsor_verification_page_masks_sensitive_values(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $verification = $sponsor->organization->verification;
        $verification->nib = '1234567890123';
        $verification->tax_id = '091234567890123';
        $verification->business_email = 'rahasia@kopi.test';
        $verification->save();

        $response = $this->actingAs($sponsor)->get('/sponsor/verification');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('sponsor/Verification')
            ->where('verification.has_nib', true)
            ->missing('verification.nib')
            ->missing('verification.tax_id')
        );

        $this->assertStringNotContainsString('1234567890123', $response->getContent());
    }

    public function test_sensitive_columns_are_encrypted_at_rest(): void
    {
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Submitted);
        $verification = $sponsor->organization->verification;
        $verification->nib = '1234567890123';
        $verification->save();

        $raw = \DB::table('sponsor_verifications')
            ->where('id', $verification->id)
            ->value('nib');

        $this->assertNotSame('1234567890123', $raw);
        $this->assertSame('1234567890123', $verification->fresh()->nib);
    }

    public function test_event_detail_does_not_leak_moderation_reason(): void
    {
        $eo = $this->eoWithOrganization();
        $event = Event::factory()->published()->create([
            'eo_organization_id' => $eo->organization->id,
            'moderation_reason_internal' => 'Catatan internal rahasia',
        ]);

        $response = $this->get("/events/{$event->slug}");
        $response->assertOk();
        $this->assertStringNotContainsString('Catatan internal rahasia', $response->getContent());
    }
}
