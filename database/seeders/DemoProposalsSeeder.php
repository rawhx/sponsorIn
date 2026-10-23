<?php

namespace Database\Seeders;

use App\Enums\ProposalStatus;
use App\Enums\ProposalType;
use App\Models\Message;
use App\Models\Proposal;
use Illuminate\Database\Seeder;

class DemoProposalsSeeder extends Seeder
{
    /**
     * @var array<string, Proposal>
     */
    public static array $proposals = [];

    public static function proposal(string $key): Proposal
    {
        return self::$proposals[$key] ?? throw new \RuntimeException("Demo proposal [{$key}] belum dibuat.");
    }

    public function run(): void
    {
        self::$proposals = [];

        foreach ($this->proposals() as $key => $data) {
            $event = DemoData::event($data['event']);
            $sender = DemoData::organization($data['sender']);
            $recipient = DemoData::organization($data['recipient']);
            $status = $data['status'];
            $acceptedAt = $data['accepted_at'] ?? ($status === ProposalStatus::Accepted ? $data['last_status_at'] : null);

            $proposal = Proposal::create([
                'event_id' => $event->id,
                'sender_org_id' => $sender->id,
                'recipient_org_id' => $recipient->id,
                'proposal_type' => $sender->isSponsor() ? ProposalType::SponsorToEo : ProposalType::EoToSponsor,
                'package_id' => isset($data['package']) ? DemoData::package($event, $data['package'])?->id : null,
                'requested_support' => $data['support'],
                'deliverables' => $data['deliverables'],
                'terms_summary' => $data['terms'],
                'status' => $status,
                'valid_until' => $data['valid_until'] ?? null,
                'sponsor_confirmed_at' => $status === ProposalStatus::Accepted ? $acceptedAt : null,
                'eo_confirmed_at' => $status === ProposalStatus::Accepted ? $acceptedAt : null,
                'last_status_at' => $data['last_status_at'],
            ]);

            $messages = $data['messages'] ?? [];
            $firstMessageAt = $messages[0][3] ?? $data['last_status_at']->copy()->subHour();
            $lastMessageAt = $messages ? end($messages)[3] : $firstMessageAt;

            $conversation = $proposal->conversation()->create([
                'participant_org_ids' => [$sender->id, $recipient->id],
            ]);

            $conversation->forceFill([
                'created_at' => $firstMessageAt,
                'updated_at' => $lastMessageAt,
            ])->save();

            foreach ($messages as [$senderEmail, $body, $read, $sentAt]) {
                $message = Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_user_id' => DemoData::user($senderEmail)->id,
                    'body' => $body,
                    'attachment_paths' => null,
                    'read_at' => $read ? $sentAt->copy()->addHour() : null,
                ]);

                $message->forceFill([
                    'created_at' => $sentAt,
                    'updated_at' => $sentAt,
                ])->save();
            }

            self::$proposals[$key] = $proposal;
        }
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function proposals(): array
    {
        return [
            'draft_s2e' => [
                'event' => 'pasar-rakyat-pesisir-demo',
                'sender' => 'sponsor.open@sponsorin.test',
                'recipient' => 'eo@sponsorin.test',
                'status' => ProposalStatus::Draft,
                'package' => 'Pendukung Utama',
                'support' => 'Dukungan dana untuk panggung utama dan area lokakarya memasak.',
                'deliverables' => 'Laporan foto dan video, rekap jangkauan publikasi, dokumentasi area booth.',
                'terms' => 'Nilai dukungan Rp15.000.000 dengan penempatan logo pada panggung utama. Rancangan ini masih berupa draft internal sponsor.',
                'valid_until' => now()->addDays(21)->toDateString(),
                'last_status_at' => now()->subDay(),
                'messages' => [],
            ],
            'sent_e2s' => [
                'event' => 'kelas-fotografi-jalanan-demo',
                'sender' => 'eo@sponsorin.test',
                'recipient' => 'sponsor.open@sponsorin.test',
                'status' => ProposalStatus::Sent,
                'package' => 'Dukungan Konsumsi',
                'support' => 'Dukungan konsumsi peserta dan honor fotografer pemandu.',
                'deliverables' => 'Dokumentasi penyerahan produk, logo pada materi kelas, dan ucapan terima kasih pada rekap acara.',
                'terms' => 'Dukungan produk senilai Rp3.000.000. Proposal dikirim dan menunggu tanggapan sponsor.',
                'valid_until' => now()->addDays(14)->toDateString(),
                'last_status_at' => now()->subHours(6),
                'messages' => [
                    ['eo@sponsorin.test', 'Halo, kami mengirim proposal dukungan konsumsi untuk Kelas Fotografi Jalanan. Ringkasan kebutuhan ada di proposal, kami terbuka untuk penyesuaian.', false, now()->subHours(6)],
                ],
            ],
            'under_review_s2e' => [
                'event' => 'cicil-kopi-cerita-demo',
                'sender' => 'sponsor.open@sponsorin.test',
                'recipient' => 'eo.muda@sponsorin.test',
                'status' => ProposalStatus::UnderReview,
                'package' => 'Modal Usaha',
                'support' => 'Dukungan dana operasional dan konsumsi untuk malam cerita petani kopi.',
                'deliverables' => 'Dokumentasi acara, rekap publikasi, dan sesi perkenalan produk singkat.',
                'terms' => 'Dukungan tunai Rp3.000.000 dengan logo pada materi acara. EO sedang meninjau kecocokan jadwal dan ruang panggung.',
                'valid_until' => now()->addDays(12)->toDateString(),
                'last_status_at' => now()->subDay(),
                'messages' => [
                    ['sponsor.open@sponsorin.test', 'Halo, kami tertarik mendukung Cicil Kopi & Cerita. Proposal sudah kami sesuaikan dengan kebutuhan acara.', true, now()->subDays(2)],
                    ['eo.muda@sponsorin.test', 'Terima kasih. Proposal sedang kami tinjau bersama tim acara, kami kabari setelah rundown final.', false, now()->subDay()],
                ],
            ],
            'more_info_e2s' => [
                'event' => 'malam-cerita-pesisir-demo',
                'sender' => 'eo@sponsorin.test',
                'recipient' => 'sponsor@sponsorin.test',
                'status' => ProposalStatus::MoreInformationRequested,
                'package' => 'Pendukung Panggung',
                'support' => 'Dukungan sewa sound system, honor pemusik, dan penerangan area.',
                'deliverables' => 'Dokumentasi panggung dan rekap acara singkat.',
                'terms' => 'Dukungan tunai Rp7.500.000 dengan logo pada backdrop panggung. Sponsor meminta rincian rundown dan estimasi jangkauan.',
                'valid_until' => now()->addDays(16)->toDateString(),
                'last_status_at' => now()->subDays(2),
                'messages' => [
                    ['eo@sponsorin.test', 'Terlampir ringkasan kebutuhan panggung dan susunan acara. Kami bisa menyesuaikan ukuran logo dan durasi ucapan.', true, now()->subDays(3)],
                    ['sponsor@sponsorin.test', 'Terima kasih. Boleh kirim rincian rundown per jam dan estimasi jangkauan publikasi sebelum kami memutuskan?', false, now()->subDays(2)],
                ],
            ],
            'negotiation_s2e' => [
                'event' => 'pasar-sehat-warga-demo',
                'sender' => 'sponsor@sponsorin.test',
                'recipient' => 'eo@sponsorin.test',
                'status' => ProposalStatus::Negotiation,
                'package' => 'Paket Kesehatan',
                'support' => 'Dukungan tenaga kesehatan dan paket pemeriksaan dasar untuk peserta.',
                'deliverables' => 'Dokumentasi layanan, rekap peserta, dan logo pada materi edukasi.',
                'terms' => 'Sponsor mengusulkan dukungan layanan senilai Rp6.000.000 dengan area layanan dan logo pada materi edukasi. EO mengusulkan penambahan booth konsultasi.',
                'valid_until' => now()->addDays(10)->toDateString(),
                'last_status_at' => now()->subHours(12),
                'messages' => [
                    ['sponsor@sponsorin.test', 'Kami bisa mendukung layanan pemeriksaan dasar dan tenaga kesehatan untuk dua hari acara.', true, now()->subDays(2)],
                    ['eo@sponsorin.test', 'Terima kasih. Kami usulkan penambahan booth konsultasi singkat dan logo pada papan jadwal pemeriksaan.', true, now()->subDay()],
                    ['sponsor@sponsorin.test', 'Penyesuaian bisa kami terima. Tolong kirimkan denah area agar kami siapkan tim.', false, now()->subHours(12)],
                ],
            ],
            'accepted_no_sponsorship' => [
                'event' => 'pasar-sehat-warga-demo',
                'sender' => 'sponsor.open@sponsorin.test',
                'recipient' => 'eo@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Paket Konsumsi',
                'support' => 'Dukungan produk konsumsi sehat untuk peserta dan relawan.',
                'deliverables' => 'Dokumentasi penyerahan produk dan logo pada meja konsumsi.',
                'terms' => 'Dukungan produk senilai Rp2.500.000. Proposal sudah diterima, tetapi record kerja sama belum dibuat agar alur pencatatan sponsorship dapat dicoba.',
                'valid_until' => now()->addDays(30)->toDateString(),
                'last_status_at' => now()->subDays(4),
                'accepted_at' => now()->subDays(4),
                'messages' => [
                    ['sponsor.open@sponsorin.test', 'Kami setuju mendukung konsumsi sehat untuk peserta dan relawan.', true, now()->subDays(5)],
                    ['eo@sponsorin.test', 'Terima kasih. Kami akan siapkan kebutuhan jumlah peserta dan jadwal pengiriman.', true, now()->subDays(4)],
                ],
            ],
            'rejected_s2e' => [
                'event' => 'lari-pagi-komunitas-demo',
                'sender' => 'sponsor.open@sponsorin.test',
                'recipient' => 'eo.muda@sponsorin.test',
                'status' => ProposalStatus::Rejected,
                'package' => 'Dukungan Logistik',
                'support' => 'Dukungan logistik minuman dan fruit box untuk peserta.',
                'deliverables' => 'Dokumentasi acara dan rekap peserta.',
                'terms' => 'Proposal ditolak karena jadwal distribusi bertabrakan dengan kampanye sponsor lain.',
                'valid_until' => now()->addDays(8)->toDateString(),
                'last_status_at' => now()->subDays(8),
                'messages' => [
                    ['sponsor.open@sponsorin.test', 'Setelah diskusi internal, kami belum bisa mendukung edisi ini karena jadwal distribusi bertabrakan.', true, now()->subDays(9)],
                    ['eo.muda@sponsorin.test', 'Terima kasih atas kabarnya. Kami tetap terbuka untuk kolaborasi pada acara berikutnya.', true, now()->subDays(8)],
                ],
            ],
            'withdrawn_e2s' => [
                'event' => 'screening-film-pendek-demo',
                'sender' => 'eo.muda@sponsorin.test',
                'recipient' => 'sponsor.open@sponsorin.test',
                'status' => ProposalStatus::Withdrawn,
                'package' => 'Paket Dokumentasi',
                'support' => 'Dukungan dokumentasi foto dan video acara.',
                'deliverables' => 'Rekap acara dan dokumentasi foto.',
                'terms' => 'Proposal ditarik karena EO mendapat dukungan dokumentasi internal.',
                'valid_until' => now()->addDays(18)->toDateString(),
                'last_status_at' => now()->subDays(6),
                'messages' => [
                    ['eo.muda@sponsorin.test', 'Mohon maaf, kami menarik proposal ini karena kebutuhan dokumentasi sudah tercakup oleh tim internal.', true, now()->subDays(6)],
                ],
            ],
            'expired_s2e' => [
                'event' => 'malam-cerita-pesisir-demo',
                'sender' => 'sponsor@sponsorin.test',
                'recipient' => 'eo@sponsorin.test',
                'status' => ProposalStatus::Expired,
                'package' => 'Pendukung Panggung',
                'support' => 'Dukungan tunai untuk panggung dan honor pemusik.',
                'deliverables' => 'Dokumentasi panggung dan rekap acara.',
                'terms' => 'Proposal melewati batas berlaku sebelum ada keputusan akhir.',
                'valid_until' => now()->subDays(2)->toDateString(),
                'last_status_at' => now()->subDays(20),
                'messages' => [],
            ],
            'active_e2s' => [
                'event' => 'pasar-rakyat-pesisir-demo',
                'sender' => 'eo@sponsorin.test',
                'recipient' => 'sponsor@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Pendukung Utama',
                'support' => 'Dukungan dana untuk panggung utama dan area lokakarya memasak.',
                'deliverables' => 'Laporan foto dan video setelah acara, rekap jangkauan publikasi, dan dokumentasi area booth.',
                'terms' => 'Dukungan tunai Rp15.000.000 dengan penempatan logo pada panggung utama dan area booth 3x3 meter.',
                'valid_until' => now()->addDays(30)->toDateString(),
                'last_status_at' => now()->subDays(5),
                'accepted_at' => now()->subDays(5),
                'messages' => [
                    ['eo@sponsorin.test', 'Kami senang bisa melanjutkan kerja sama ini. Tim kami akan menyiapkan materi panggung dan area booth.', true, now()->subDays(6)],
                    ['sponsor@sponsorin.test', 'Konfirmasi dari kami. Mohon kirimkan jadwal pemasangan booth dan kebutuhan listrik.', true, now()->subDays(5)],
                ],
            ],
            'completion_e2s' => [
                'event' => 'kelas-fotografi-jalanan-demo',
                'sender' => 'eo@sponsorin.test',
                'recipient' => 'sponsor.open@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Dukungan Konsumsi',
                'support' => 'Dukungan konsumsi peserta dan honor fotografer pemandu.',
                'deliverables' => 'Dokumentasi penyerahan produk, logo pada materi kelas, dan rekap acara.',
                'terms' => 'Dukungan produk senilai Rp3.000.000. Seluruh rangkaian acara sudah selesai dan EO meminta konfirmasi penyelesaian.',
                'valid_until' => now()->addDays(25)->toDateString(),
                'last_status_at' => now()->subDays(2),
                'accepted_at' => now()->subDays(9),
                'messages' => [
                    ['eo@sponsorin.test', 'Dokumentasi dan laporan sudah kami siapkan. Mohon konfirmasi penyelesaian kerja sama agar ulasan bisa diberikan.', false, now()->subDays(2)],
                ],
            ],
            'completed_editable_s2e' => [
                'event' => 'cicil-kopi-cerita-demo',
                'sender' => 'sponsor@sponsorin.test',
                'recipient' => 'eo.muda@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Modal Usaha',
                'support' => 'Dukungan dana operasional dan konsumsi acara.',
                'deliverables' => 'Dokumentasi acara, rekap publikasi, dan sesi perkenalan produk.',
                'terms' => 'Dukungan tunai Rp3.000.000. Kerja sama selesai dan ulasan masih dalam batas edit 24 jam.',
                'valid_until' => now()->addDays(20)->toDateString(),
                'last_status_at' => now()->subDay(),
                'accepted_at' => now()->subDays(30),
                'messages' => [
                    ['sponsor@sponsorin.test', 'Kerja sama berjalan baik, dokumentasi sudah kami terima. Terima kasih untuk koordinasinya.', true, now()->subDay()],
                ],
            ],
            'completed_locked_s2e' => [
                'event' => 'lari-pagi-komunitas-demo',
                'sender' => 'sponsor@sponsorin.test',
                'recipient' => 'eo.muda@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Dukungan Logistik',
                'support' => 'Dukungan logistik minuman dan fruit box untuk peserta.',
                'deliverables' => 'Dokumentasi acara dan rekap peserta.',
                'terms' => 'Dukungan logistik senilai Rp4.000.000. Kerja sama selesai lebih dari 24 jam lalu sehingga ulasan tidak dapat diedit.',
                'valid_until' => now()->addDays(15)->toDateString(),
                'last_status_at' => now()->subDays(10),
                'accepted_at' => now()->subDays(60),
                'messages' => [
                    ['sponsor@sponsorin.test', 'Terima kasih, laporan dan dokumentasi sudah lengkap. Kami puas dengan pelaksanaannya.', true, now()->subDays(10)],
                ],
            ],
            'completed_no_review_e2s' => [
                'event' => 'screening-film-pendek-demo',
                'sender' => 'eo.muda@sponsorin.test',
                'recipient' => 'sponsor@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Paket Dokumentasi',
                'support' => 'Dukungan dokumentasi foto dan video acara.',
                'deliverables' => 'Rekap acara dan dokumentasi foto.',
                'terms' => 'Dukungan dokumentasi senilai Rp2.000.000. Kerja sama selesai dan sponsor belum memberi ulasan.',
                'valid_until' => now()->addDays(18)->toDateString(),
                'last_status_at' => now()->subDays(2),
                'accepted_at' => now()->subDays(25),
                'messages' => [
                    ['eo.muda@sponsorin.test', 'Laporan sudah dikirim. Silakan beri ulasan bila sudah ditinjau, agar profil kami terbantu.', true, now()->subDays(2)],
                ],
            ],
            'completed_hidden_s2e' => [
                'event' => 'pasar-sehat-warga-demo',
                'sender' => 'sponsor.open@sponsorin.test',
                'recipient' => 'eo@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Paket Kesehatan',
                'support' => 'Dukungan tenaga kesehatan dan paket pemeriksaan dasar.',
                'deliverables' => 'Dokumentasi layanan, rekap peserta, dan logo pada materi edukasi.',
                'terms' => 'Dukungan layanan kesehatan senilai Rp6.000.000. Kerja sama selesai dan ulasan disembunyikan admin.',
                'valid_until' => now()->addDays(12)->toDateString(),
                'last_status_at' => now()->subDays(15),
                'accepted_at' => now()->subDays(50),
                'messages' => [
                    ['sponsor.open@sponsorin.test', 'Ada beberapa catatan terkait penempatan logo, tetapi secara umum acara berjalan baik.', true, now()->subDays(16)],
                ],
            ],
            'disputed_e2s' => [
                'event' => 'pameran-ilustrasi-demo',
                'sender' => 'eo.muda@sponsorin.test',
                'recipient' => 'sponsor.open@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Media Kolaborasi',
                'support' => 'Dukungan konten kolaborasi dan dokumentasi pameran.',
                'deliverables' => 'Dua konten kolaborasi dan rekap pameran.',
                'terms' => 'Dukungan media senilai Rp5.000.000. EO meminta penyelesaian, tetapi sponsor mengajukan sengketa karena satu konten belum tayang.',
                'valid_until' => now()->addDays(14)->toDateString(),
                'last_status_at' => now()->subDay(),
                'accepted_at' => now()->subDays(18),
                'messages' => [
                    ['eo.muda@sponsorin.test', 'Kami sudah mengirim deliverable dan dokumentasi. Mohon konfirmasi penyelesaian kerja sama.', true, now()->subDays(3)],
                    ['sponsor.open@sponsorin.test', 'Ada satu konten kolaborasi yang belum tayang sesuai jadwal. Kami ajukan sengketa agar dibahas bersama.', true, now()->subDay()],
                ],
            ],
            'needs_admin_s2e' => [
                'event' => 'kelas-fotografi-jalanan-demo',
                'sender' => 'sponsor.open@sponsorin.test',
                'recipient' => 'eo@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Dukungan Konsumsi',
                'support' => 'Dukungan konsumsi dan perlengkapan kelas.',
                'deliverables' => 'Dokumentasi penyerahan produk dan rekap acara.',
                'terms' => 'Dukungan produk senilai Rp2.000.000. Permintaan penyelesaian tidak direspons lebih dari 7 hari sehingga masuk antrean admin.',
                'valid_until' => now()->addDays(10)->toDateString(),
                'last_status_at' => now()->subDays(8),
                'accepted_at' => now()->subDays(20),
                'messages' => [
                    ['sponsor.open@sponsorin.test', 'Kami belum menerima konfirmasi penyelesaian. Mohon ditindaklanjuti agar kerja sama dapat kami tutup.', true, now()->subDays(9)],
                ],
            ],
            'cancelled_e2s' => [
                'event' => 'malam-cerita-pesisir-demo',
                'sender' => 'eo@sponsorin.test',
                'recipient' => 'sponsor@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Pendukung Panggung',
                'support' => 'Dukungan tunai untuk panggung dan honor pemusik.',
                'deliverables' => 'Dokumentasi panggung dan rekap acara.',
                'terms' => 'Kerja sama dibatalkan karena perubahan jadwal venue dan acara ditunda.',
                'valid_until' => now()->addDays(9)->toDateString(),
                'last_status_at' => now()->subDays(12),
                'accepted_at' => now()->subDays(15),
                'messages' => [
                    ['eo@sponsorin.test', 'Acara berubah jadwal dan venue. Kami membatalkan kerja sama ini untuk sementara dan akan menghubungi kembali setelah tanggal baru tersedia.', true, now()->subDays(12)],
                ],
            ],
            'completed_public_review_e2s' => [
                'event' => 'kelas-fotografi-jalanan-demo',
                'sender' => 'eo@sponsorin.test',
                'recipient' => 'sponsor.open@sponsorin.test',
                'status' => ProposalStatus::Accepted,
                'package' => 'Dukungan Konsumsi',
                'support' => 'Dukungan konsumsi peserta dan dokumentasi kelas.',
                'deliverables' => 'Dokumentasi penyerahan produk dan rekap acara.',
                'terms' => 'Dukungan produk senilai Rp2.500.000. Kerja sama selesai dengan ulasan publik 5/5.',
                'valid_until' => now()->addDays(22)->toDateString(),
                'last_status_at' => now()->subDays(5),
                'accepted_at' => now()->subDays(22),
                'messages' => [
                    ['sponsor.open@sponsorin.test', 'Terima kasih, kerja sama lancar dan dokumentasi rapi. Ulasan sudah kami kirim.', true, now()->subDays(5)],
                ],
            ],
        ];
    }
}
