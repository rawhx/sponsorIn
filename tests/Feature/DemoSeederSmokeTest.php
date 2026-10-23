<?php

namespace Tests\Feature;

use App\Enums\AccountStatus;
use App\Enums\AudienceEvidenceType;
use App\Enums\EventStatus;
use App\Enums\EvidenceVerificationStatus;
use App\Enums\OrganizationType;
use App\Enums\PackageAvailability;
use App\Enums\ProposalPreference;
use App\Enums\ProposalStatus;
use App\Enums\ProposalType;
use App\Enums\ReportStatus;
use App\Enums\ReportTargetType;
use App\Enums\ReviewStatus;
use App\Enums\SponsorshipStatus;
use App\Enums\SponsorVerificationStatus;
use App\Enums\SupportType;
use App\Enums\UserRole;
use App\Models\Event;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Sponsorship;
use App\Models\SponsorVerification;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoProposalsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoSeederSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_seeder_covers_all_scenarios_and_renders_role_pages(): void
    {
        config(['hashing.bcrypt.rounds' => 4]);

        $this->seed(DatabaseSeeder::class);

        foreach (UserRole::cases() as $status) {
            $this->assertDatabaseHas('users', ['role' => $status->value]);
        }

        foreach (AccountStatus::cases() as $status) {
            $this->assertDatabaseHas('users', ['account_status' => $status->value]);
        }

        foreach (OrganizationType::cases() as $status) {
            $this->assertDatabaseHas('organizations', ['type' => $status->value]);
        }

        foreach (ProposalPreference::cases() as $status) {
            $this->assertDatabaseHas('organizations', ['proposal_preference' => $status->value]);
        }

        foreach (SponsorVerificationStatus::cases() as $status) {
            $this->assertDatabaseHas('sponsor_verifications', ['status' => $status->value]);
        }

        foreach (EventStatus::cases() as $status) {
            $this->assertDatabaseHas('events', ['status' => $status->value]);
        }

        foreach (AudienceEvidenceType::cases() as $status) {
            $this->assertDatabaseHas('audience_evidence', ['evidence_type' => $status->value]);
        }

        foreach (EvidenceVerificationStatus::cases() as $status) {
            $this->assertDatabaseHas('audience_evidence', ['verification_status' => $status->value]);
        }

        foreach (SupportType::cases() as $status) {
            $this->assertDatabaseHas('sponsorship_packages', ['support_type' => $status->value]);
        }

        foreach (PackageAvailability::cases() as $status) {
            $this->assertDatabaseHas('sponsorship_packages', ['availability_status' => $status->value]);
        }

        foreach (ProposalStatus::cases() as $status) {
            $this->assertDatabaseHas('proposals', ['status' => $status->value]);
        }

        foreach (ProposalType::cases() as $status) {
            $this->assertDatabaseHas('proposals', ['proposal_type' => $status->value]);
        }

        foreach (SponsorshipStatus::cases() as $status) {
            $this->assertDatabaseHas('sponsorships', ['status' => $status->value]);
        }

        foreach (ReviewStatus::cases() as $status) {
            $this->assertDatabaseHas('reviews', ['status' => $status->value]);
        }

        foreach (ReportStatus::cases() as $status) {
            $this->assertDatabaseHas('reports', ['status' => $status->value]);
        }

        foreach (ReportTargetType::cases() as $status) {
            $this->assertDatabaseHas('reports', ['target_type' => $status->value]);
        }

        $this->assertSame(16, User::count());
        $this->assertSame(16, Event::count());
        $this->assertSame(19, Proposal::count());
        $this->assertSame(10, Sponsorship::count());
        $this->assertSame(4, Review::count());
        $this->assertSame(1, Proposal::query()->where('status', ProposalStatus::Accepted)->doesntHave('sponsorship')->count());

        $eo = User::query()->where('email', 'eo@sponsorin.test')->firstOrFail();
        $sponsor = User::query()->where('email', 'sponsor@sponsorin.test')->firstOrFail();
        $pendingSponsor = User::query()->where('email', 'sponsor.pending@sponsorin.test')->firstOrFail();
        $needsInfoSponsor = User::query()->where('email', 'sponsor.needsinfo@sponsorin.test')->firstOrFail();
        $admin = User::query()->where('email', 'admin@sponsorin.test')->firstOrFail();
        $verifier = User::query()->where('email', 'verifier@sponsorin.test')->firstOrFail();

        $event = Event::query()->where('slug', 'pasar-rakyat-pesisir-demo')->firstOrFail();
        $draftEvent = Event::query()->where('slug', 'lokakarya-kriya-demo')->firstOrFail();
        $festival = Event::query()->where('slug', 'festival-tari-sekolah-demo')->firstOrFail();
        $pendingVerification = SponsorVerification::query()
            ->where('organization_id', $pendingSponsor->organization->id)
            ->firstOrFail();
        $activeProposal = DemoProposalsSeeder::proposal('active_e2s');
        $activeSponsorship = $activeProposal->sponsorship;

        $this->get('/')->assertOk();
        $this->get('/events')->assertOk();
        $this->get('/events/'.$event->slug)->assertOk();
        $this->get('/organizers')->assertOk();
        $this->get('/organizers/'.$eo->organization->id)->assertOk();

        foreach ([$admin, $verifier] as $staff) {
            $this->actingAs($staff)->get('/admin/dashboard')->assertOk();
            $this->actingAs($staff)->get('/admin/verifications')->assertOk();
            $this->actingAs($staff)->get('/admin/verifications/'.$pendingVerification->id)->assertOk();
            $this->actingAs($staff)->get('/admin/events')->assertOk();
            $this->actingAs($staff)->get('/admin/events/'.$festival->id)->assertOk();
            $this->actingAs($staff)->get('/admin/reviews')->assertOk();
        }

        $this->actingAs($eo)->get('/eo/dashboard')->assertOk();
        $this->actingAs($eo)->get('/eo/events')->assertOk();
        $this->actingAs($eo)->get('/eo/events/'.$draftEvent->id)->assertOk();
        $this->actingAs($eo)->get('/eo/events/'.$draftEvent->id.'/edit')->assertOk();
        $this->actingAs($eo)->get('/eo/proposals')->assertOk();
        $this->actingAs($eo)->get('/eo/proposals/'.$activeProposal->id)->assertOk();
        $this->actingAs($eo)->get('/eo/sponsorships')->assertOk();
        $this->actingAs($eo)->get('/eo/sponsorships/'.$activeSponsorship->id)->assertOk();
        $this->actingAs($eo)->get('/notifications')->assertOk();

        $this->actingAs($sponsor)->get('/sponsor/dashboard')->assertOk();
        $this->actingAs($sponsor)->get('/sponsor/verification')->assertOk();
        $this->actingAs($sponsor)->get('/sponsor/shortlist')->assertOk();
        $this->actingAs($sponsor)->get('/sponsor/proposals')->assertOk();
        $this->actingAs($sponsor)->get('/sponsor/proposals/'.$activeProposal->id)->assertOk();
        $this->actingAs($sponsor)->get('/sponsor/sponsorships')->assertOk();
        $this->actingAs($sponsor)->get('/sponsor/sponsorships/'.$activeSponsorship->id)->assertOk();
        $this->actingAs($sponsor)->get('/notifications')->assertOk();

        $this->actingAs($pendingSponsor)->get('/sponsor/dashboard')->assertOk();
        $this->actingAs($pendingSponsor)->get('/sponsor/verification')->assertOk();
        $this->actingAs($needsInfoSponsor)->get('/sponsor/verification')->assertOk();
    }
}
