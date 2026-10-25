<?php

namespace Tests\Feature;

use App\Enums\AccountStatus;
use App\Enums\EventStatus;
use App\Enums\ReportStatus;
use App\Enums\ReportTargetType;
use App\Enums\ReviewStatus;
use App\Enums\SponsorshipStatus;
use App\Models\Event;
use App\Models\Report;
use App\Models\Review;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportFlowTest extends TestCase
{
    use RefreshDatabase;

    private function publishedReview(): array
    {
        $eo = $this->eoOrganization();
        $sponsor = $this->activeSponsorOrganization();
        $event = Event::factory()->create(['eo_organization_id' => $eo->id, 'status' => EventStatus::Published, 'published_at' => now()]);
        $sponsorship = Sponsorship::factory()->for($event)
            ->for($sponsor, 'sponsorOrganization')->for($eo, 'eoOrganization')
            ->create(['status' => SponsorshipStatus::Completed]);
        $review = Review::factory()->create([
            'sponsorship_id' => $sponsorship->id,
            'sponsor_org_id' => $sponsor->id,
            'eo_org_id' => $eo->id,
            'status' => ReviewStatus::Published,
        ]);

        return [$review, $eo, $sponsor, $event];
    }

    public function test_eo_can_report_review_about_them_but_not_delete_it(): void
    {
        [$review, $eo] = $this->publishedReview();

        $this->actingAs($eo->owner)->post('/reports', [
            'target_type' => 'review',
            'target_id' => $review->id,
            'reason' => 'review_inaccurate',
            'details' => 'Deliverable sudah diserahkan.',
        ])->assertRedirect();

        $this->assertDatabaseHas('reports', [
            'reporter_user_id' => $eo->owner->id,
            'target_type' => ReportTargetType::Review->value,
            'target_id' => $review->id,
            'status' => ReportStatus::Open->value,
        ]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'report.created']);
        // Ulasan tetap tampil selama laporan ditinjau (PRD 7.5).
        $this->assertSame(ReviewStatus::Published, $review->fresh()->status);
    }

    public function test_unrelated_user_cannot_report_a_review(): void
    {
        [$review] = $this->publishedReview();
        $outsider = $this->eoOrganization();

        $this->actingAs($outsider->owner)->post('/reports', [
            'target_type' => 'review', 'target_id' => $review->id, 'reason' => 'spam',
        ])->assertForbidden();

        $this->assertDatabaseCount('reports', 0);
    }

    public function test_sponsor_author_can_request_correction_of_own_review(): void
    {
        [$review, , $sponsor] = $this->publishedReview();

        $this->actingAs($sponsor->owner)->post('/reports', [
            'target_type' => 'review', 'target_id' => $review->id, 'reason' => 'review_data_error',
            'details' => 'Salah memilih event.',
        ])->assertRedirect();

        $this->assertDatabaseCount('reports', 1);
    }

    public function test_user_can_report_a_published_event_but_not_their_own_or_a_draft(): void
    {
        [, $eo, $sponsor, $event] = $this->publishedReview();
        $draft = Event::factory()->create(['eo_organization_id' => $eo->id, 'status' => EventStatus::Draft]);

        $this->actingAs($sponsor->owner)->post('/reports', [
            'target_type' => 'event', 'target_id' => $event->id, 'reason' => 'misleading_info',
        ])->assertRedirect();
        $this->assertDatabaseCount('reports', 1);

        $this->actingAs($eo->owner)->post('/reports', [
            'target_type' => 'event', 'target_id' => $event->id, 'reason' => 'spam',
        ])->assertForbidden();

        $this->actingAs($sponsor->owner)->post('/reports', [
            'target_type' => 'event', 'target_id' => $draft->id, 'reason' => 'spam',
        ])->assertNotFound();
        $this->assertDatabaseCount('reports', 1);
    }

    public function test_account_report_maps_organization_to_owner_and_blocks_self_and_staff(): void
    {
        [, $eo, $sponsor] = $this->publishedReview();
        $admin = User::factory()->admin()->create();

        $this->actingAs($sponsor->owner)->post('/reports', [
            'target_type' => 'account', 'target_id' => $eo->id, 'reason' => 'impersonation',
        ])->assertRedirect();
        $this->assertDatabaseHas('reports', [
            'target_type' => 'account', 'target_id' => $eo->owner_user_id,
        ]);

        $this->actingAs($eo->owner)->post('/reports', [
            'target_type' => 'account', 'target_id' => $eo->id, 'reason' => 'spam',
        ])->assertForbidden();

        $this->actingAs($sponsor->owner)->post('/reports', [
            'target_type' => 'account', 'target_id' => $admin->id, 'reason' => 'spam',
        ])->assertStatus(403);
    }

    public function test_duplicate_open_report_is_rejected_and_reason_must_match_target(): void
    {
        [, , $sponsor, $event] = $this->publishedReview();
        $payload = ['target_type' => 'event', 'target_id' => $event->id, 'reason' => 'spam'];

        $this->actingAs($sponsor->owner)->post('/reports', $payload)->assertRedirect();
        $this->actingAs($sponsor->owner)->post('/reports', $payload)->assertSessionHasErrors('reason');
        $this->assertDatabaseCount('reports', 1);

        // "review_inaccurate" tidak berlaku untuk event.
        $this->actingAs($sponsor->owner)->post('/reports', [
            'target_type' => 'event', 'target_id' => $event->id, 'reason' => 'review_inaccurate',
        ])->assertSessionHasErrors('reason');
    }

    public function test_guest_cannot_report(): void
    {
        [, , , $event] = $this->publishedReview();

        $this->post('/reports', ['target_type' => 'event', 'target_id' => $event->id, 'reason' => 'spam'])
            ->assertRedirect('/login');
    }

    public function test_admin_can_review_and_close_report_with_audit_trail(): void
    {
        [$review, $eo] = $this->publishedReview();
        $admin = User::factory()->admin()->create();
        $this->actingAs($eo->owner)->post('/reports', [
            'target_type' => 'review', 'target_id' => $review->id, 'reason' => 'review_inaccurate',
        ]);
        $report = Report::firstOrFail();

        $this->actingAs($admin)->get('/admin/reports')->assertOk();
        $this->actingAs($admin)->get("/admin/reports/{$report->id}")->assertOk();

        $this->actingAs($admin)->put("/admin/reports/{$report->id}", ['status' => 'in_review'])->assertRedirect();
        $this->assertSame(ReportStatus::InReview, $report->fresh()->status);
        $this->assertSame($admin->id, $report->fresh()->assigned_admin_id);

        $this->actingAs($admin)->put("/admin/reports/{$report->id}", ['status' => 'resolved'])
            ->assertSessionHasErrors('resolution');

        $this->actingAs($admin)->put("/admin/reports/{$report->id}", [
            'status' => 'dismissed', 'resolution' => 'Ulasan sesuai kebijakan; tidak dihapus.',
        ])->assertRedirect();

        $report->refresh();
        $this->assertSame(ReportStatus::Dismissed, $report->status);
        $this->assertNotNull($report->resolved_at);
        $this->assertDatabaseHas('audit_logs', ['action' => 'report.in_review', 'actor_user_id' => $admin->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'report.dismissed', 'actor_user_id' => $admin->id]);

        // Laporan yang sudah ditutup tidak dapat diubah lagi.
        $this->actingAs($admin)->put("/admin/reports/{$report->id}", ['status' => 'resolved', 'resolution' => 'x'])
            ->assertSessionHasErrors('status');
    }

    public function test_non_staff_cannot_open_admin_reports_or_audit_log(): void
    {
        [, $eo, $sponsor] = $this->publishedReview();

        $this->actingAs($sponsor->owner)->get('/admin/reports')->assertForbidden();
        $this->actingAs($eo->owner)->get('/admin/audit-log')->assertForbidden();
    }

    public function test_resolving_account_report_can_suspend_account_and_revokes_access(): void
    {
        [, $eo, $sponsor] = $this->publishedReview();
        $admin = User::factory()->admin()->create();
        $this->actingAs($sponsor->owner)->post('/reports', [
            'target_type' => 'account', 'target_id' => $eo->id, 'reason' => 'suspected_fraud',
        ]);
        $report = Report::firstOrFail();

        $this->actingAs($admin)->put("/admin/reports/{$report->id}", [
            'status' => 'resolved', 'resolution' => 'Terbukti menyalahgunakan platform.', 'suspend_account' => true,
        ])->assertRedirect();

        $this->assertSame(AccountStatus::Suspended, $eo->owner->fresh()->account_status);
        $this->assertDatabaseHas('audit_logs', ['action' => 'account.suspended', 'entity_id' => $eo->owner_user_id]);

        // Sesi login yang masih aktif pun kehilangan akses area EO.
        $this->actingAs($eo->owner->fresh())->get('/eo/dashboard')->assertForbidden();
    }

    public function test_cannot_suspend_account_from_non_account_report(): void
    {
        [$review, $eo, $sponsor] = $this->publishedReview();
        $admin = User::factory()->admin()->create();
        $this->actingAs($eo->owner)->post('/reports', [
            'target_type' => 'review', 'target_id' => $review->id, 'reason' => 'review_inaccurate',
        ]);
        $report = Report::firstOrFail();

        $this->actingAs($admin)->put("/admin/reports/{$report->id}", [
            'status' => 'resolved', 'resolution' => 'Coba.', 'suspend_account' => true,
        ])->assertStatus(422);

        $this->assertSame(AccountStatus::Active, $sponsor->owner->fresh()->account_status);
        $this->assertSame(ReportStatus::Open, $report->fresh()->status);
    }

    public function test_audit_log_page_lists_and_filters_entries(): void
    {
        [$review, , , ] = $this->publishedReview();
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post("/admin/reviews/{$review->id}/hide", ['reason' => 'Melanggar kebijakan.']);

        $this->actingAs($admin)->get('/admin/audit-log')->assertOk();
        $this->actingAs($admin)->get('/admin/audit-log?entity=Review&q=hidden')->assertOk();
        $this->actingAs($admin)->get('/admin/audit-log?entity=Bogus')->assertSessionHasErrors('entity');
    }

    public function test_restoring_a_hidden_review_is_audited_and_recalculates_rating(): void
    {
        [$review, $eo] = $this->publishedReview();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post("/admin/reviews/{$review->id}/hide", ['reason' => 'Melanggar kebijakan.']);
        $this->assertSame(0, $eo->fresh()->review_count);

        $this->actingAs($admin)->post("/admin/reviews/{$review->id}/restore")->assertRedirect();

        $this->assertSame(ReviewStatus::Published, $review->fresh()->status);
        $this->assertSame(1, $eo->fresh()->review_count);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'review.restored', 'entity_id' => $review->id, 'actor_user_id' => $admin->id,
        ]);
        // Kedua pihak diberi tahu soal penyembunyian dan penayangan ulang.
        $this->assertSame(
            2,
            $eo->owner->notifications()->where('type', \App\Notifications\ReviewModerationNotification::class)->count()
        );
    }

    public function test_restoring_a_review_that_is_not_hidden_is_rejected(): void
    {
        [$review] = $this->publishedReview();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post("/admin/reviews/{$review->id}/restore")->assertStatus(422);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'review.restored']);
    }
}
