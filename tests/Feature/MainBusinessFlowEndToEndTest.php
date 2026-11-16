<?php

namespace Tests\Feature;

use App\Enums\AudienceEvidenceType;
use App\Enums\EventStatus;
use App\Enums\ProposalStatus;
use App\Enums\ProposalType;
use App\Enums\SponsorshipStatus;
use App\Enums\SponsorVerificationStatus;
use App\Enums\SupportType;
use App\Models\Event;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MainBusinessFlowEndToEndTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_main_business_flow_from_event_creation_to_deal_and_review(): void
    {
        // =========================================================================
        // 1. SETUP AKUN: EO, ADMIN, dan SPONSOR AKTIF
        // =========================================================================
        $eo = $this->eoWithOrganization();
        $admin = User::factory()->admin()->create();
        $sponsor = $this->sponsorWithVerification(SponsorVerificationStatus::Approved);

        $this->assertNotNull($eo->organization);
        $this->assertNotNull($sponsor->organization);
        $this->assertTrue($sponsor->hasActiveSponsorAccess());

        // =========================================================================
        // 2. EO MEMBUAT EVENT BARU (Draft)
        // =========================================================================
        $eventPayload = [
            'title' => 'Indonesia Tech & Startup Summit 2026',
            'category' => 'Teknologi',
            'format' => 'Hybrid',
            'date_start' => now()->addDays(30)->toDateString(),
            'date_end' => now()->addDays(32)->toDateString(),
            'location' => 'Jakarta Convention Center, Senayan',
            'description' => 'Konferensi startup dan teknologi tahunan terbesar di Indonesia yang mempertemukan inovator, founder, dan investor.',
            'audience_profile' => 'Professional teknologi, founder startup, investor VC, dan mahasiswa teknik informatika.',
            'capacity_estimate' => 2500,
            'support_needs' => 'Sponsorship booth, dana panggung utama, dan partner konsumsi acara.',
        ];

        $responseCreate = $this->actingAs($eo)->post('/eo/events', $eventPayload);
        $responseCreate->assertRedirect();

        $event = Event::firstWhere('title', 'Indonesia Tech & Startup Summit 2026');
        $this->assertNotNull($event, 'Event harus berhasil dibuat.');
        $this->assertSame(EventStatus::Draft, $event->status, 'Status awal event harus Draft.');
        $this->assertSame($eo->organization->id, $event->eo_organization_id);

        // =========================================================================
        // 3. EO MENAMBAHKAN BUKTI AUDIENS & PAKET SPONSORSHIP
        // =========================================================================
        // Tambahkan Bukti Audiens
        $this->actingAs($eo)->post("/eo/events/{$event->id}/evidence", [
            'evidence_type' => AudienceEvidenceType::Projection->value,
            'value' => 2500,
            'unit' => 'peserta',
            'period' => now()->addDays(30)->toDateString() . ' s/d ' . now()->addDays(32)->toDateString(),
            'source_description' => 'Rencana proyeksi internal EO',
            'evidence_note' => 'Berdasarkan kapasitas ruangan dan penjualan early bird tahun sebelumnya.',
        ])->assertRedirect();

        $this->assertDatabaseHas('audience_evidence', [
            'event_id' => $event->id,
            'value' => 2500,
            'unit' => 'peserta',
        ]);

        // Tambahkan Paket Sponsorship
        $this->actingAs($eo)->post("/eo/events/{$event->id}/packages", [
            'name' => 'Platinum Sponsor',
            'support_type' => SupportType::Cash->value,
            'price_amount' => 50000000,
            'currency' => 'IDR',
            'benefits' => [
                'Logo utama di backdrop panggung dan materi digital',
                'Booth eksklusif ukuran 4x4 meter di foyer utama',
                'Keynote speech 15 menit pada sesi pembukaan',
            ],
            'deliverables' => [
                'Laporan dokumentasi foto dan video pasca event',
                'Daftar kontak peserta yang memberikan izin kontak (lead data)',
                '10 pass VIP untuk eksekutif sponsor',
            ],
            'availability_status' => 'available',
            'notes' => 'Benefit dapat disesuaikan pada sesi negosiasi.',
        ])->assertRedirect();

        $package = $event->packages()->first();
        $this->assertNotNull($package, 'Paket sponsorship harus tersimpan.');
        $this->assertSame('Platinum Sponsor', $package->name);
        $this->assertCount(3, $package->benefits);
        $this->assertCount(3, $package->deliverables);

        // =========================================================================
        // 4. EO MENGAJUKAN EVENT UNTUK REVIEW MODERASI
        // =========================================================================
        $this->actingAs($eo)->post("/eo/events/{$event->id}/submit")->assertRedirect();
        $event->refresh();
        $this->assertSame(EventStatus::UnderReview, $event->status, 'Event berstatus Under Review.');

        // Pastikan event Under Review belum tampil pada listing publik
        $this->assertFalse($event->status->isPublic());

        // =========================================================================
        // 5. ADMIN MEMERIKSA & MENYETUJUI EVENT (Approve -> Published)
        // =========================================================================
        $this->actingAs($admin)->post("/admin/events/{$event->id}/decision", [
            'decision' => 'approve',
            'reason' => 'Data acara lengkap dan bukti audiens terverifikasi layak.',
        ])->assertRedirect();

        $event->refresh();
        $this->assertSame(EventStatus::Published, $event->status, 'Event harus berstatus Published.');
        $this->assertTrue($event->status->isPublic(), 'Event Published harus bisa diakses publik.');

        // =========================================================================
        // 6. SPONSOR MENEMUKAN EVENT & MENYIMPAN KE SHORTLIST
        // =========================================================================
        $this->actingAs($sponsor)->post("/sponsor/events/{$event->id}/shortlist")->assertRedirect();
        $this->assertDatabaseHas('shortlists', [
            'organization_id' => $sponsor->organization->id,
            'event_id' => $event->id,
        ]);

        // =========================================================================
        // 7. SPONSOR MENGAJUKAN MINAT / PROPOSAL KE EO
        // =========================================================================
        $proposalResponse = $this->actingAs($sponsor)->post("/sponsor/events/{$event->id}/proposals", [
            'package_id' => $package->id,
            'requested_support' => 'Kami berminat mengambil paket Platinum Sponsor dengan penyesuaian penempatan booth.',
            'terms_summary' => 'Dukungan dana Rp 50.000.000 dengan hak keynote dan booth utama.',
            'deliverables' => $package->deliverables,
        ]);
        $proposalResponse->assertRedirect();

        $proposal = Proposal::where('event_id', $event->id)->first();
        $this->assertNotNull($proposal, 'Proposal sponsorship harus terbentuk.');
        $this->assertSame(ProposalType::SponsorToEo, $proposal->proposal_type);
        $this->assertSame(ProposalStatus::Sent, $proposal->status);
        $this->assertSame($sponsor->organization->id, $proposal->sender_org_id);
        $this->assertSame($eo->organization->id, $proposal->recipient_org_id);
        $this->assertNotNull($proposal->conversation, 'Conversation otomatis terbentuk untuk diskusi.');

        // =========================================================================
        // 8. EO & SPONSOR BERDISKUSI DAN MELAKUKAN NEGOSIASI
        // =========================================================================
        // EO meninjau proposal dan mengubah status ke Negotiation
        $this->actingAs($eo)->post("/eo/proposals/{$proposal->id}/transition", [
            'status' => ProposalStatus::Negotiation->value,
            'reason' => 'Kami menyambut baik dan siap menyesuaikan letak booth.',
        ])->assertRedirect();

        $proposal->refresh();
        $this->assertSame(ProposalStatus::Negotiation, $proposal->status);

        // EO mengirim pesan ke sponsor
        $this->actingAs($eo)->post("/eo/proposals/{$proposal->id}/messages", [
            'body' => 'Halo tim sponsor! Kami sudah siapkan slot booth di dekat pintu masuk hall utama.',
        ])->assertRedirect();

        // Sponsor membalas pesan EO
        $this->actingAs($sponsor)->post("/sponsor/proposals/{$proposal->id}/messages", [
            'body' => 'Terima kasih, kami sepakat dengan lokasi booth tersebut. Silakan diproses persetujuannya.',
        ])->assertRedirect();

        $this->assertCount(3, $proposal->conversation->fresh()->messages);

        // =========================================================================
        // 9. PERSETUJUAN KESEPAKATAN (Proposal Accepted -> Deal Terbentuk)
        // =========================================================================
        // EO menerima proposal yang sudah disepakati
        $this->actingAs($eo)->post("/eo/proposals/{$proposal->id}/transition", [
            'status' => ProposalStatus::Accepted->value,
            'reason' => 'Kesepakatan tercapai dengan kedua belah pihak.',
        ])->assertRedirect();

        $proposal->refresh();
        $this->assertSame(ProposalStatus::Accepted, $proposal->status);

        // Kedua pihak mengonfirmasi ringkasan kesepakatan menjadi record SPONSORSHIP resmi
        $this->actingAs($sponsor)->post("/sponsor/proposals/{$proposal->id}/sponsorship")->assertRedirect();

        $sponsorship = Sponsorship::where('proposal_id', $proposal->id)->first();
        $this->assertNotNull($sponsorship, 'Record sponsorship resmi harus terbentuk dari kesepakatan.');
        $this->assertSame(SponsorshipStatus::Active, $sponsorship->status);
        $this->assertSame($event->id, $sponsorship->event_id);
        $this->assertSame($sponsor->organization->id, $sponsorship->sponsor_org_id);
        $this->assertSame($eo->organization->id, $sponsorship->eo_org_id);

        // =========================================================================
        // 10. PENYELESAIAN KERJA SAMA (Completion Request -> Confirm Completion)
        // =========================================================================
        // EO mengajukan penyelesaian sponsorship setelah acara selesai
        $this->actingAs($eo)->post("/eo/sponsorships/{$sponsorship->id}/request-completion")->assertRedirect();
        $sponsorship->refresh();
        $this->assertSame(SponsorshipStatus::CompletionRequested, $sponsorship->status);

        // Sponsor mengonfirmasi penyelesaian
        $this->actingAs($sponsor)->post("/sponsor/sponsorships/{$sponsorship->id}/confirm-completion")->assertRedirect();
        $sponsorship->refresh();
        $this->assertSame(SponsorshipStatus::Completed, $sponsorship->status);
        $this->assertNotNull($sponsorship->completed_at);

        // =========================================================================
        // 11. SPONSOR MEMBERIKAN ULASAN & RATING KEPADA EO (Siklus Selesai Penuh)
        // =========================================================================
        $this->actingAs($sponsor)->post("/sponsor/sponsorships/{$sponsorship->id}/review", [
            'overall_rating' => 5,
            'communication_rating' => 5,
            'professionalism_rating' => 5,
            'deliverables_rating' => 5,
            'comment' => 'Kerja sama yang sangat profesional! Penyelenggara memenuhi semua benefit dan deliverables sesuai kesepakatan.',
        ])->assertRedirect();

        $review = Review::where('sponsorship_id', $sponsorship->id)->first();
        $this->assertNotNull($review, 'Ulasan sponsor harus tersimpan.');
        $this->assertSame(5, $review->overall_rating);

        // Pastikan agregat rating EO terhitung
        $eoOrganization = $eo->organization->fresh();
        $this->assertSame(1, $eoOrganization->review_count);
        $this->assertEquals(5.0, (float) $eoOrganization->rating_average);
    }
}
