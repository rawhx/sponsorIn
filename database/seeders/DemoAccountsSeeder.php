<?php

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\BusinessLegalForm;
use App\Enums\OrganizationType;
use App\Enums\ProposalPreference;
use App\Enums\SponsorVerificationStatus;
use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\SponsorVerification;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoAccountsSeeder extends Seeder
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public static function accounts(): array
    {
        return [
            [
                'name' => 'Admin SponsorIn',
                'email' => 'admin@sponsorin.test',
                'role' => UserRole::Admin,
            ],
            [
                'name' => 'Verifier SponsorIn',
                'email' => 'verifier@sponsorin.test',
                'role' => UserRole::Verifier,
            ],
            [
                'name' => 'Rani Prameswari',
                'email' => 'eo@sponsorin.test',
                'role' => UserRole::Eo,
                'organization' => [
                    'type' => OrganizationType::Eo,
                    'legal_name' => 'Ruang Temu Kolektif',
                    'display_name' => 'Ruang Temu Kolektif',
                    'description' => 'Organizer kecil di Yogyakarta yang menyusun pasar rakyat, kelas kreatif, dan pertunjukan komunitas bersama warga lokal.',
                    'category' => 'Komunitas & budaya',
                    'location' => 'Yogyakarta',
                    'public_contact' => 'halo@ruangtemu.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Open,
                ],
            ],
            [
                'name' => 'Bagas Nurwanto',
                'email' => 'eo.muda@sponsorin.test',
                'role' => UserRole::Eo,
                'organization' => [
                    'type' => OrganizationType::Eo,
                    'legal_name' => 'Studio Cerita Muda',
                    'display_name' => 'Studio Cerita Muda',
                    'description' => 'Kolektif muda Bandung yang menggarap acara kuliner, olahraga komunitas, pameran ilustrasi, dan layar tancap.',
                    'category' => 'Seni & komunitas',
                    'location' => 'Bandung',
                    'public_contact' => 'halo@studicerita.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Open,
                ],
            ],
            [
                'name' => 'Laras Widuri',
                'email' => 'eo.hidden@sponsorin.test',
                'role' => UserRole::Eo,
                'organization' => [
                    'type' => OrganizationType::Eo,
                    'legal_name' => 'Pasar Loak Nusantara',
                    'display_name' => 'Pasar Loak Nusantara',
                    'description' => 'Komunitas pasar loak dan barang bekas layak pakai di Surabaya. Profil ini sengaja disembunyikan dari direktori publik untuk pengujian.',
                    'category' => 'Komunitas',
                    'location' => 'Surabaya',
                    'public_contact' => 'halo@pasarloak.test',
                    'public_visibility' => false,
                    'proposal_preference' => ProposalPreference::Open,
                ],
            ],
            [
                'name' => 'Dimas Aditya',
                'email' => 'sponsor@sponsorin.test',
                'role' => UserRole::Sponsor,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'PT Kopi Lembah Nusantara',
                    'display_name' => 'Kopi Lembah',
                    'description' => 'Brand kopi yang mendukung kegiatan komunitas, ekonomi lokal, dan ruang belajar terbuka.',
                    'category' => 'Makanan & minuman',
                    'location' => 'Bandung',
                    'public_contact' => 'halo@kopilembah.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Selective,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::Approved,
                    'legal_form' => BusinessLegalForm::Pt,
                    'nib' => '1234567890123',
                    'tax_id' => '091234567890123',
                    'document' => true,
                    'submitted_days_ago' => 14,
                    'reviewed_days_ago' => 12,
                    'reviewer' => 'admin@sponsorin.test',
                    'internal' => 'Data usaha dan dokumen pendukung sesuai pada saat pemeriksaan.',
                    'public' => 'Verifikasi usaha disetujui. Akun sponsor aktif.',
                ],
            ],
            [
                'name' => 'Ayu Lestari',
                'email' => 'sponsor.open@sponsorin.test',
                'role' => UserRole::Sponsor,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'PT Sinar Rasa Nusantara',
                    'display_name' => 'Sinar Rasa',
                    'description' => 'Perusahaan makanan olahan yang membuka kemitraan untuk acara komunitas, olahraga, dan seni.',
                    'category' => 'Makanan & minuman',
                    'location' => 'Jakarta',
                    'public_contact' => 'kolaborasi@sinarrasa.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Open,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::Approved,
                    'legal_form' => BusinessLegalForm::Pt,
                    'nib' => '2234567890123',
                    'tax_id' => '091234567890223',
                    'document' => true,
                    'submitted_days_ago' => 20,
                    'reviewed_days_ago' => 18,
                    'reviewer' => 'verifier@sponsorin.test',
                    'internal' => 'Dokumen legal dan rekening usaha terverifikasi.',
                    'public' => 'Verifikasi usaha disetujui. Akun sponsor aktif.',
                ],
            ],
            [
                'name' => 'Reza Mahendra',
                'email' => 'sponsor.closed@sponsorin.test',
                'role' => UserRole::Sponsor,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'PT Griya Herbal Nusantara',
                    'display_name' => 'Griya Herbal',
                    'description' => 'Produsen produk herbal yang hanya membuka kemitraan berdasarkan undangan atau proposal langsung.',
                    'category' => 'Kesehatan',
                    'location' => 'Surabaya',
                    'public_contact' => 'halo@griyaherbal.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Closed,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::Approved,
                    'legal_form' => BusinessLegalForm::Pt,
                    'nib' => '3234567890123',
                    'tax_id' => '091234567890323',
                    'document' => true,
                    'submitted_days_ago' => 30,
                    'reviewed_days_ago' => 28,
                    'reviewer' => 'admin@sponsorin.test',
                    'internal' => 'Verifikasi selesai. Sponsor memilih menerima proposal secara terbatas.',
                    'public' => 'Verifikasi usaha disetujui. Akun sponsor aktif.',
                ],
            ],
            [
                'name' => 'Nadia Kusuma',
                'email' => 'sponsor.pending@sponsorin.test',
                'role' => UserRole::Sponsor,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'CV Tenun Pesisir',
                    'display_name' => 'Tenun Pesisir',
                    'description' => 'Usaha tenun yang ingin mendukung kegiatan budaya dan pemberdayaan perajin.',
                    'category' => 'Fesyen & kriya',
                    'location' => 'Semarang',
                    'public_contact' => 'halo@tenunpesisir.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Open,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::Submitted,
                    'legal_form' => BusinessLegalForm::Cv,
                    'nib' => '9876543210987',
                    'tax_id' => '081234567890987',
                    'document' => true,
                    'submitted_hours_ago' => 6,
                    'reviewer' => null,
                ],
            ],
            [
                'name' => 'Fajar Ramadhan',
                'email' => 'sponsor.review@sponsorin.test',
                'role' => UserRole::Sponsor,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'PT Bank Mitra Desa',
                    'display_name' => 'Bank Mitra Desa',
                    'description' => 'Lembaga keuangan yang mendukung program literasi keuangan dan pemberdayaan desa.',
                    'category' => 'Jasa keuangan',
                    'location' => 'Jakarta',
                    'public_contact' => 'csr@bankmitradesa.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Selective,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::UnderReview,
                    'legal_form' => BusinessLegalForm::Pt,
                    'nib' => '4234567890123',
                    'tax_id' => '091234567890423',
                    'document' => true,
                    'submitted_days_ago' => 2,
                    'reviewer' => 'verifier@sponsorin.test',
                ],
            ],
            [
                'name' => 'Sinta Maharani',
                'email' => 'sponsor.needsinfo@sponsorin.test',
                'role' => UserRole::Sponsor,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'CV Sekolah Kopi Rakyat',
                    'display_name' => 'Sekolah Kopi Rakyat',
                    'description' => 'Ruang pelatihan kopi untuk petani muda dan barista pemula.',
                    'category' => 'Pendidikan',
                    'location' => 'Bandung',
                    'public_contact' => 'halo@sekolahkopi.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Open,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::NeedsInformation,
                    'legal_form' => BusinessLegalForm::Cv,
                    'nib' => '5234567890123',
                    'tax_id' => '091234567890523',
                    'document' => true,
                    'submitted_days_ago' => 6,
                    'reviewed_days_ago' => 4,
                    'reviewer' => 'verifier@sponsorin.test',
                    'internal' => 'Dokumen pendukung belum mencantumkan alamat usaha terbaru.',
                    'public' => 'Mohon perbarui dokumen pendukung dan alamat usaha sebelum verifikasi dilanjutkan.',
                ],
            ],
            [
                'name' => 'Yusuf Hidayat',
                'email' => 'sponsor.rejected@sponsorin.test',
                'role' => UserRole::Sponsor,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'Aroma Rempah Hidayat',
                    'display_name' => 'Aroma Rempah',
                    'description' => 'Usaha rempah rumahan yang mengajukan kemitraan untuk kegiatan bazar.',
                    'category' => 'Makanan & minuman',
                    'location' => 'Semarang',
                    'public_contact' => 'halo@aromarempah.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Open,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::Rejected,
                    'legal_form' => BusinessLegalForm::Perorangan,
                    'nib' => '6234567890123',
                    'tax_id' => '091234567890623',
                    'document' => true,
                    'submitted_days_ago' => 12,
                    'reviewed_days_ago' => 10,
                    'reviewer' => 'admin@sponsorin.test',
                    'internal' => 'Nama usaha pada dokumen tidak sesuai dengan data pengajuan.',
                    'public' => 'Verifikasi belum dapat disetujui karena data usaha pada dokumen tidak sesuai. Silakan perbaiki lalu ajukan kembali.',
                ],
            ],
            [
                'name' => 'Maya Anggraini',
                'email' => 'sponsor.suspended@sponsorin.test',
                'role' => UserRole::Sponsor,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'Koperasi Karya Bumi',
                    'display_name' => 'Karya Bumi',
                    'description' => 'Koperasi produsen kerajinan yang sebelumnya aktif mendukung pasar komunitas.',
                    'category' => 'Kriya',
                    'location' => 'Yogyakarta',
                    'public_contact' => 'halo@karyabumi.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Selective,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::Suspended,
                    'legal_form' => BusinessLegalForm::Koperasi,
                    'nib' => '7234567890123',
                    'tax_id' => '091234567890723',
                    'document' => true,
                    'submitted_days_ago' => 40,
                    'reviewed_days_ago' => 38,
                    'reviewer' => 'admin@sponsorin.test',
                    'internal' => 'Verifikasi ditangguhkan sementara menunggu pembaruan dokumen koperasi.',
                    'public' => 'Akses sponsor ditangguhkan sementara. Hubungi tim SponsorIn untuk informasi lebih lanjut.',
                ],
            ],
            [
                'name' => 'Bimo Saputra',
                'email' => 'sponsor.draft@sponsorin.test',
                'role' => UserRole::Sponsor,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'Rintisan Baru Firma',
                    'display_name' => 'Rintisan Baru',
                    'description' => 'Usaha baru yang sedang menyiapkan data verifikasi.',
                    'category' => 'Teknologi',
                    'location' => 'Solo',
                    'public_contact' => 'halo@rintisanbaru.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Open,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::Draft,
                    'legal_form' => BusinessLegalForm::Firma,
                    'nib' => null,
                    'tax_id' => null,
                    'document' => false,
                    'reviewer' => null,
                ],
            ],
            [
                'name' => 'Citra Anindita',
                'email' => 'unverified@sponsorin.test',
                'role' => UserRole::Sponsor,
                'email_verified' => false,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'Citra Studio',
                    'display_name' => 'Citra Studio',
                    'description' => 'Studio dokumentasi yang belum menyelesaikan verifikasi email dan usaha.',
                    'category' => 'Media & dokumentasi',
                    'location' => 'Bandung',
                    'public_contact' => 'halo@citrastudio.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Open,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::Draft,
                    'legal_form' => BusinessLegalForm::Perorangan,
                    'nib' => null,
                    'tax_id' => null,
                    'document' => false,
                    'reviewer' => null,
                ],
            ],
            [
                'name' => 'Hendra Wijaya',
                'email' => 'blocked@sponsorin.test',
                'role' => UserRole::Sponsor,
                'account_status' => AccountStatus::Suspended,
                'organization' => [
                    'type' => OrganizationType::Sponsor,
                    'legal_name' => 'PT Langkah Terbatas',
                    'display_name' => 'Langkah Terbatas',
                    'description' => 'Akun sponsor dengan verifikasi disetujui tetapi status akun sedang ditangguhkan.',
                    'category' => 'Transportasi',
                    'location' => 'Jakarta',
                    'public_contact' => 'halo@langkahterbatas.test',
                    'public_visibility' => true,
                    'proposal_preference' => ProposalPreference::Selective,
                ],
                'verification' => [
                    'status' => SponsorVerificationStatus::Approved,
                    'legal_form' => BusinessLegalForm::Pt,
                    'nib' => '8234567890123',
                    'tax_id' => '091234567890823',
                    'document' => true,
                    'submitted_days_ago' => 50,
                    'reviewed_days_ago' => 48,
                    'reviewer' => 'admin@sponsorin.test',
                    'internal' => 'Verifikasi usaha disetujui. Status akun ditangguhkan oleh admin.',
                    'public' => 'Verifikasi usaha disetujui, tetapi akun sedang ditangguhkan.',
                ],
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function emails(): array
    {
        return array_column(self::accounts(), 'email');
    }

    public function run(): void
    {
        $reviewers = [];

        foreach (self::accounts() as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => DemoData::PASSWORD,
                    'role' => $data['role'],
                    'account_status' => $data['account_status'] ?? AccountStatus::Active,
                ]
            );

            $user->forceFill([
                'email_verified_at' => ($data['email_verified'] ?? true) ? now() : null,
            ])->save();

            $reviewers[$data['email']] = $user;

            if (! isset($data['organization'])) {
                continue;
            }

            $organization = Organization::updateOrCreate(
                ['owner_user_id' => $user->id],
                $data['organization']
            );

            if (isset($data['verification'])) {
                $this->seedVerification($organization, $data['verification'], $reviewers);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, User>  $reviewers
     */
    private function seedVerification(Organization $organization, array $data, array $reviewers): void
    {
        $reviewerEmail = $data['reviewer'] ?? null;
        $reviewer = $reviewerEmail ? ($reviewers[$reviewerEmail] ?? DemoData::user($reviewerEmail)) : null;

        SponsorVerification::updateOrCreate(
            ['organization_id' => $organization->id],
            [
                'business_email' => $organization->public_contact,
                'legal_form' => $data['legal_form'] ?? null,
                'nib' => $data['nib'] ?? null,
                'tax_id' => $data['tax_id'] ?? null,
                'supporting_document_path' => ($data['document'] ?? false) ? DemoData::document($organization) : null,
                'status' => $data['status'],
                'submitted_at' => $this->submittedAt($data),
                'reviewed_by' => $reviewer?->id,
                'reviewed_at' => isset($data['reviewed_days_ago']) ? now()->subDays($data['reviewed_days_ago']) : null,
                'decision_reason_internal' => $data['internal'] ?? null,
                'decision_reason_public' => $data['public'] ?? null,
            ]
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function submittedAt(array $data): mixed
    {
        if (isset($data['submitted_hours_ago'])) {
            return now()->subHours($data['submitted_hours_ago']);
        }

        if (isset($data['submitted_days_ago'])) {
            return now()->subDays($data['submitted_days_ago']);
        }

        return null;
    }
}
