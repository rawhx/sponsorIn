# SponsorIn - Dokumentasi Proyek

SponsorIn adalah marketplace kemitraan dua sisi antara **Sponsor** (brand/perusahaan) dan **EO** (Event Organizer). Dokumentasi ini menjelaskan struktur proyek, peran akun, alur kerja, seed data demo, dan instruksi menjalankan aplikasi.

> Sumber kebenaran utama: `docs/rules/PRD_SponsorIn_v2.1_AI_Build_Ready.docx` (Role dan Hak Akses, Aturan Bisnis, Persyaratan Fungsional).

## 1. Role dan Hak Akses

Setiap akun memiliki `role` yang dikontrol di backend (route/middleware, bukan sekadar menyembunyikan tombol di frontend). Role yang didukung:

| Role | Huruf | Deskripsi singkat |
|------|-------|-------------------|
| Sponsor | `sponsor` | Brand/perusahaan yang mencari, menilai, dan mengelola kemitraan sponsorship. |
| EO (Event Organizer) | `eo` | Penyelenggara event yang membuat event, mengirim proposal, dan mengelola sponsorship. |
| Verifier / Admin | `admin` - `verifier` | Tim internal yang memeriksa verifikasi sponsor, memoderasi event/ulasan, menangani laporan, melihat audit log. |
| Guest | (tidak login) | Melihat landing page dan event publik yang diizinkan; mendaftar atau login. |

### 1.1 Izin utama per role

#### Sponsor (Pending / Active)

**Status akun:**

- **Pending**: email terverifikasi, verifikasi internal belum selesai. Melihat status verifikasi, melengkapi dokumen, menanggapi permintaan perbaikan. Tidak bisa mengirim proposal/penawaran, melihat data internal, atau menggunakan fitur sponsor aktif.
- **Active**: verifikasi internal disetujui. Mencari event, menyimpan shortlist, mengirim minat/penawaran, menerima proposal, berkomunikasi, mengelola sponsorship, memberi ulasan setelah selesai.

**Fitur sponsor aktif (hanya setelah verifikasi Approved):**

- `/sponsor/dashboard` - ringkasan, status verifikasi, shortlist, sponsorship aktif.
- `/sponsor/events` + `/sponsor/events/{id}` - pencarian/filter event dan shortlist.
- `/sponsor/proposals` + `/sponsor/proposals/{id}` - proposal masuk/keluar dan status.
- `/sponsor/sponsorships` + `/sponsor/sponsorships/{id}` - manajemen sponsorship, request/confirm completion, dispute, review.
- `/sponsor/verification` - kelola form verifikasi sponsor.

**Larangan utama sponsor:**

- Tidak boleh mengubah hasil verifikasi sendiri.
- Tidak boleh mengulas sponsorship yang belum selesai.
- Tidak boleh mengakses area admin.
- Fitur sponsorship aktif terkunci sampai verifikasi disetujui.

#### EO (Active)

- Email terverifikasi; profil tersedia; listing tunduk pada moderasi.
- Melihat dashboard, event miliknya, proposal, sponsorship, rating.
- Tidak boleh menghapus/mengubah ulasan sponsor; dapat melaporkan ulasan.
- Larangan: tidak bisa mengubah event milik EO lain; tidak bisa mengakses area admin.

#### Admin / Verifier

- Melihat antrean verifikasi sponsor, memutuskan (approve / request informasi / reject), memverifikasi event, memoderasi review, menangani laporan, melihat audit log.
- Larangan: tidak boleh mengakses data tanpa kebutuhan kerja; setiap keputusan harus tercatat.

### 1.2 Middleware dan policy akses

Route berikut menegaskan role di backend:

- `role:sponsor` - hanya sponsor aktif yang bisa membuka area sponsor.
- `role:eo` - hanya EO yang bisa membuka area EO.
- `role:admin,verifier` - hanya admin/verifier yang bisa membuka area admin.
- `sponsor.active` - fitur sponsor aktif hanya tersedia jika verifikasi usaha disetujui.

Akses `role` dicek di server/backend, bukan hanya dengan menyembunyikan tombol di frontend.

## 2. Alur Utama

### 2.1 Registrasi dan aktivasi sponsor

1. Pengguna memilih role **Sponsor** pada halaman registrasi.
2. Mengisi: nama, email perusahaan/usaha, password, nama perusahaan/usaha, bentuk usaha, NIB, NPWP/identitas pajak, dokumen pendukung.
3. Sistem mengirim tautan verifikasi email. Email terverifikasi **tidak otomatis** berarti bisnis terverifikasi.
4. Setelah pengajuan lengkap, status menjadi **Pending Verification**; fitur sponsor aktif terkunci.
5. Verifier memeriksa data dan dokumen. Keputusan: **Approved**, **Needs Information**, atau **Rejected**.
6. Jika **Needs Information**, sponsor menerima email dan dapat memperbarui pengajuan.
7. Jika **Approved**, akun diaktifkan dan notifikasi aktivasi dikirim ke email yang didaftarkan.
8. Jika **Rejected**, sponsor melihat status dan alasan umum yang aman dibagikan serta instruksi mengajukan ulang.

### 2.2 Verifikasi sponsor

**Status verifikasi:** `Draft`, `Submitted`, `Under Review`, `Needs Information`, `Approved`, `Rejected`, `Suspended`.

- `Draft`: form tersimpan, belum dikirim.
- `Submitted`: pengajuan lengkap dikirim ke verifier.
- `Under Review`: ada verifikasi sudah dimulai.
- `Needs Information`: verifikasi menunggu data tambahan.
- `Approved`: verifikasi setuju, akun sponsor diaktifkan.
- `Rejected`: verifikasi ditolak.
- `Suspended`: akses ditangguhkan sementara.

Form verifikasi menuntut: `business_name`, `business_email` (email), `legal_form` (enum: PT/CV/Firma/Koperasi/Yayasan/Usaha perorangan/Lainnya), `nib`, `tax_id`, `supporting_document` (PDF/JPG/JPEG/PNG, maks 5 MB). NIB dan NPWP dienkripsi di repa dan dimasking di UI. Dokumen disimpan di private storage (bukan folder publik).

### 2.3 EO membuat event

1. EO login, pilih Buat Event.
2. Isi detail event, lokasi, tanggal, kategori, target audiens, kapasitas/estimasi, kebutuhan dukungan, paket dan benefit, data audiens dengan label sumber.
3. Simpan sebagai **Draft** atau kirim untuk review.
4. Admin menyetujui atau meminta perbaikan/menolak dengan alasan.
5. Event yang disetujui berstatus **Published** dan tampil pada hasil pencarian sesuai filter. Draft/Under Review/Rejected tidak tampil publik.

### 2.4 Sponsor menemukan dan menghubungi EO

1. Sponsor Active mencari event atau filter: kategori, lokasi, tanggal, jenis dukungan, kisaran paket, jenis bukti audiens.
2. Lihat kartu event (ringkasan, status bukti utama, paket, EO, data audiens).
3. Simpan shortlist, minta informasi, atau kirim minat/penawaran.
4. EO menerima notifikasi, merespons.

### 2.5 EO mengirim proposal ke sponsor

- EO mengirim proposal hanya ke sponsor yang dapat menerima proposal.
- Proposal mencakup ringkasan event, profil audiens, paket/benefit, nilai/jenis dukungan, deliverables, tanggal, lampiran.
- Sponsor menerima notifikasi, meminta informasi, menolak, atau masuk negosiasi.
- Proposal yang diterima tidak otomatis berarti sponsorship selesai; kedua pihak mengonfirmasi ringkasan kesepakatan.

### 2.6 Dari kesepakatan ke sponsorship selesai

1. Setelah kedua pihak mengonfirmasi ringkasan kesepakatan, sistem membuat record **Sponsorship** dengan status **Active**.
2. Setiap pihak bisa meminta penandaan selesai.
3. Saat salah satu pihak meminta penyelesaian, pihak lain mendapat notifikasi dan bisa **Confirm Completion** atau **Raise Dispute**.
4. Jika pihak lain setuju → **Completed**. Jika ada sengketa → **Disputed**, ulasan terkunci sampai admin menyelesaikan.
5. Jika tidak ada respons 7 hari kalender → status masuk **Needs Admin Review**.
6. Setelah **Completed**, sponsor mendapat CTA Beri Rating dan Ulasan ke EO. EO tidak memberi rating balik pada MVP.

## 3. Entitas Data

| Entitas | Field inti minimum | Catatan |
|---------|--------------------|---------|
| User | id, email, password, role, account_status, email_verified_at | Role: sponsor/eo/admin/verifier. Password di-hash. |
| Organization | id, owner_user_id, type, legal_name, display_name, description, category, location, public_contact, public_visibility | Milik user; field publik dipisahkan dari field verifikasi. |
| SponsorVerification | id, organization_id, business_email, legal_form, nib, tax_id, supporting_document_path, status, submitted_at, reviewed_by, reviewed_at, decision_reason_internal, decision_reason_public | Akses sangat terbatas; NIB/NPWP dienkripsi; dokumen tidak disimpan di folder publik. |
| Event | id, eo_organization_id, title, category, format, date_start/end, location, description, audience_profile, capacity_or_estimate, support_needs, status, published_at | Dimiliki EO; status moderasi wajib; hanya Published yang bisa ditemukan publik. |
| AudienceEvidence | id, event_id, evidence_type, value, unit, period, source_description, file_ref, verification_status | Jenis bukti: projection, registration, tickets_sold, check_in, past_event, community/reach. |
| SponsorshipPackage | id, event_id, name, support_type, price_or_value, currency, benefits, deliverables, availability_status | Support type: cash, product, service, media, other. |
| Proposal | id, event_id, sender_org_id, recipient_org_id, proposal_type, package_id, requested_support, deliverables, terms_summary, status, valid_until | proposal_type: EO_TO_SPONSOR atau SPONSOR_TO_EO. |
| Conversation | id, proposal_id, participant_org_ids | Hanya peserta terkait yang bisa mengakses. |
| Message | id, conversation_id, sender_user_id, body, attachment_refs, created_at, read_at | Sender harus peserta conversation. |
| Sponsorship | id, proposal_id, sponsor_org_id, eo_org_id, event_id, agreed_terms, deliverables, status, accepted_at, completion_requested_by, completion_requested_at, completed_at | Dibuat setelah kedua pihak mengonfirmasi ringkasan. |
| Review | id, sponsorship_id, sponsor_org_id, eo_org_id, overall_rating, communication_rating, professionalism_rating, deliverables_rating, comment, status, submitted_at, edited_at, published_at | Unique sponsorship_id; rating 1-5; hanya sponsor pada sponsorship Completed. |
| Notification | id, recipient_user_id, type, title, body, related_entity_type/id, read_at, created_at | Penerima harus memiliki akses ke entitas terkait. |
| Report | id, reporter_user_id, target_type, target_id, reason, details, status, assigned_admin_id, resolution, created_at | Mencakup event, akun, review. |
| AuditLog | id, actor_user_id, action, entity_type, entity_id, before_summary, after_summary, reason, created_at | Tidak menyimpan password, token, NPWP mentah, atau isi dokumen sensitif. |

## 4. Seed Data Demo

Seeder demo membuat akun demo untuk tiap role agar lingkungan testing usable. Data ini **hanya untuk development/testing**; jangan pakai di production.

### 4.1 Menjalankan seeder

```bash
php artisan db:seed --class=DatabaseSeeder
```

Atau jika menggunakan docker compose:

```bash
make seed
```

Seeder mencetak password default akhir:

```bash
Seeder demo selesai. Gunakan password "sponsorin123" untuk semua akun demo.
```

### 4.2 Akun demo

| Role | Nama | Email | Status | Password |
|------|------|-------|--------|----------|
| `admin` | Admin SponsorIn | `admin@sponsorin.test` | Aktif | `sponsorin123` |
| `verifier` | Verifier SponsorIn | `verifier@sponsorin.test` | Aktif | `sponsorin123` |
| `eo` | Rani Prameswari | `eo@sponsorin.test` | Aktif | `sponsorin123` |
| `eo` | Bagas Nurwanto | `eo.muda@sponsorin.test` | Aktif | `sponsorin123` |
| `eo` | Laras Widuri | `eo.hidden@sponsorin.test` | Aktif (hidden) | `sponsorin123` |
| `sponsor` | Dimas Aditya | `sponsor@sponsorin.test` | Approved / Aktif | `sponsorin123` |
| `sponsor` | Ayu Lestari | `sponsor.open@sponsorin.test` | Approved / Aktif | `sponsorin123` |
| `sponsor` | Reza Mahendra | `sponsor.closed@sponsorin.test` | Approved / Aktif | `sponsorin123` |
| `sponsor` | Nadia Kusuma | `sponsor.pending@sponsorin.test` | Submitted (pending review) | `sponsorin123` |
| `sponsor` | Fajar Ramadhan | `sponsor.review@sponsorin.test` | Under Review | `sponsorin123` |
| `sponsor` | Sinta Maharani | `sponsor.needsinfo@sponsorin.test` | Needs Information | `sponsorin123` |
| `sponsor` | Yusuf Hidayat | `sponsor.rejected@sponsorin.test` | Rejected | `sponsorin123` |
| `sponsor` | Maya Anggraini | `sponsor.suspended@sponsorin.test` | Suspended | `sponsorin123` |
| `sponsor` | Bimo Saputra | `sponsor.draft@sponsorin.test` | Draft | `sponsorin123` |

### 4.3 Cara mengisi akun (registration + admin seeding)

1. **Registrasi guest**: buka `/register`, pilih role `sponsor` atau `eo`, isi form. Sistem mengirim tautan verifikasi email.
2. **Verifikasi email**: klik link yang dikirim. Email terverifikasi belum otomatis = bisnis terverifikasi.
3. **Pengajuan verifikasi**: untuk sponsor, isi form verifikasi (`business_name`, `business_email`, `legal_form`, `nib`, `tax_id`, `supporting_document`), lalu **kirim**.
4. **Keputusan verifier/admin**: masuk ke `/admin/verifications`, pilih `approved`, `needs_information`, atau `rejected`. Hanya admin/verifier yang bisa mengambil keputusan.
5. Setelah **approved**, sponsor aktif: fitur `/sponsor/*` terbuka.

### 4.4 Peran dalam proyek (peran data)

Data dalam proyek dibedakan atas:

- **Akun demo** (disediakan seeder): siap pakai di development/testing.
- **Akun asli**: tidak disediakan di repo; env var atau seeder yang sesuai digunakan.
- **Data sensitif** (NIB/NPWP/dokumen): dienkripsi/veiled, tidak tampil di profil publik, dan tidak dicetak general.

## 5. Akun Testing, Kata Sandi, dan Aksi per Role

> Hanya untuk lingkungan **local/testing**. Jangan gunakan akun dan data ini di production.

### 5.1 Berikut cara mengisi seed data demo

Jalankan seeder demo (hanya aman di lingkungan non-production):

```bash
php artisan db:seed --class=DatabaseSeeder
```

Atau, jika menggunakan docker compose:

```bash
make seed
```

Seeder akan membuat akun demo berikut dengan **password yang sama** untuk semua akun: `sponsorin123`.

### 5.2 Daftar akun demo

| Nama | Email | Role | Status | Password |
|------|-------|------|--------|----------|
| Admin SponsorIn | `admin@sponsorin.test` | `admin` | Aktif | `sponsorin123` |
| Verifier SponsorIn | `verifier@sponsorin.test` | `verifier` | Aktif | `sponsorin123` |
| Rani Prameswari (EO) | `eo@sponsorin.test` | `eo` | Aktif | `sponsorin123` |
| Bagas Nurwanto (EO) | `eo.muda@sponsorin.test` | `eo` | Aktif | `sponsorin123` |
| Laras Widuri (EO, hidden) | `eo.hidden@sponsorin.test` | `eo` | Aktif | `sponsorin123` |
| Dimas Aditya (Sponsor) | `sponsor@sponsorin.test` | `sponsor` | Approved + Aktif | `sponsorin123` |
| Ayu Lestari (Sponsor) | `sponsor.open@sponsorin.test` | `sponsor` | Approved + Aktif | `sponsorin123` |
| Reza Mahendra (Sponsor) | `sponsor.closed@sponsorin.test` | `sponsor` | Approved + Aktif | `sponsorin123` |
| Nadia Kusuma (Sponsor) | `sponsor.pending@sponsorin.test` | `sponsor` | Submitted (pending review) | `sponsorin123` |
| Fajar Ramadhan (Sponsor) | `sponsor.review@sponsorin.test` | `sponsor` | Under Review | `sponsorin123` |
| Sinta Maharani (Sponsor) | `sponsor.needsinfo@sponsorin.test` | `sponsor` | Needs Information | `sponsorin123` |
| Yusuf Hidayat (Sponsor) | `sponsor.rejected@sponsorin.test` | `sponsor` | Rejected | `sponsorin123` |
| Maya Anggraini (Sponsor) | `sponsor.suspended@sponsorin.test` | `sponsor` | Suspended | `sponsorin123` |
| Bimo Saputra (Sponsor) | `sponsor.draft@sponsorin.test` | `sponsor` | Draft | `sponsorin123` |

> Catatan: `Dimas Aditya`, `Ayu Lestari`, dan `Reza Mahendra` adalah sponsor **Active** (verifikasi Approved). `Nadia Kusuma` hingga `Maya Anggraini` adalah sponsor **Pending** dengan status berbeda (Submitted, Under Review, Needs Information, Rejected, Suspended, Draft).

### 5.3 Aksi yang bisa dilakukan berdasarkan role

#### Admin (`admin@sponsorin.test`)

- Melihat antrean verifikasi sponsor pada `/admin/verifications`.
- Memutuskan verifikasi: **Approved**, **Needs Information**, **Rejected**.
  - Approve: mengaktifkan akses sponsor aktif, mencatat `reviewed_by`, `reviewed_at`, alasan.
  - Needs Information: meminta data tambahan (wajib alasan publik).
  - Reject: mengirimkan alasan umum yang aman.
- Memoderasi event pada `/admin/events` (approve / request changes / reject / unpublish).
- Memoderasi review pada `/admin/reviews` (hide / restore).
- Melihat laporan penyalahgunaan pada `/admin/reports`.
- Melihat audit log pada `/admin/audit-log`.
- Tidak boleh mengubah hasil verifikasi dari area sponsor; hanya menerima keputusan lewat alur admin.

#### Verifier (`verifier@sponsorin.test`)

- Melihat daftar verifikasi dalam proses di dashboard admin.
- Mengecek dokumen sponsor, meminta informasi, menyetujui/menolak.
- Tidak dapat mengakses data tanpa kebutuhan kerja.

#### EO (`eo@sponsorin.test`, `eo.muda@sponsorin.test`, `eo.hidden@sponsorin.test`)

- Melihat dashboard EO (`/eo/dashboard`).
- Membuat, mengedit, mengirim review, menerbitkan, menutup event (`/eo/events`).
- Menyimpan bukti audiens event (`/eo/events/{id}/evidence`).
- Mengelola paket (`/eo/events/{id}/packages`).
- Melihat proposal masuk/keluar (`/eo/proposals`) dan transisi status.
- Mengelola sponsorship (`/eo/sponsorships`).
- Melihat rating/ulasan publik EO.
- Tidak bisa menghapus/mengubah ulasan sponsor; dapat melaporkan ulasan.

#### Sponsor (`sponsor@sponsorin.test`, `sponsor.open@sponsorin.test`, `sponsor.closed@sponsorin.test`)

- Melihat dashboard sponsor aktif (`/sponsor/dashboard`).
- Melihat status verifikasi (`/sponsor/verification`).
- Mencari/filter event (`/sponsor/events`), simpan shortlist (`/sponsor/shortlist`).
- Mengirim proposal minat (`/sponsor/proposals`).
- Mengelola sponsorship: request/confirm completion, dispute, review (`/sponsor/sponsorships`).
- Memberi rating/ulasan ke EO setelah sponsorship Completed.

**Aksi sponsor pending** (verifikasi belum Approved, e.g. `sponsor.pending@sponsorin.test`):

- Hanya bisa melihat status verifikasi dan melengkapi data (`/sponsor/verification`).
- Tidak bisa mengakses fitur sponsor aktif: shortlist, proposal, sponsorship, review, ulasan.
- Ada workflow permintaan informasi: klik **Proceed** untuk menyelesaikan form; klik **Cancel** untuk batalkan.

#### Guest

- Melihat landing page, event publik, detail event, profil EO.
- Mendaftar (Sponsor/EO) atau login.

### 5.4 Kata sandi demo

Jika lupa atau ingin mereset, semua akun demo menggunakan password:

```text
sponsorin123
```

Password tersebut juga dicetak oleh seeder:

```text
Seeder demo selesai. Gunakan password "sponsorin123" untuk semua akun demo.
```

## 6. Setup dan Jalankan Aplikasi

### 6.1 Dependensi

- PHP ^8.2 (proyek target `^8.2`; Dockerfile menggunakan PHP 8.4 CLI)
- Composer
- Node ^18+ / npm (Vite build)
- PostgreSQL (production/local docker) atau SQLite (testing in-memory)

### 6.2 Install dari sumber

```bash
composer install
php artisan key:generate
php artisan migrate --force
npm install
npm run build
```

Atau gunakan script setup bawaan:

```bash
composer setup
```

### 6.3 Development (docker)

```bash
make up
make seed
```

Akses aplikasi di `http://localhost:8000` (web), `http://localhost:5273` (Vite dev), `http://localhost:5433` (PostgreSQL), `http://localhost:1025` (Mailpit SMTP).

### 6.4 Testing

```bash
make test
```

Atau:

```bash
composer test
```

Uji fitur mencakup registrasi, verifikasi, moderasi, lifecycle proposal/sponsorship, role access, notifikasi, shortlist, dan privasi data sensitif.

### 6.5 Pint (PHP-CS-Fixer)

```bash
make pint
```

## 7. Environment Variables

Salin `.env.example` ke `.env` dan sesuaikan:

```bash
cp .env.example .env
php artisan key:generate
```

Variabel penting:

| Variable | Nilai default (local) | Catatan |
|----------|----------------------|---------|
| `APP_ENV` | `local` / `testing` | Setel `production` di release. |
| `APP_DEBUG` | `true` (local) | Matikan di production. |
| `APP_URL` | `http://localhost:8000` | URL aplikasi. |
| `DB_CONNECTION` | `pgsql` (local) / `sqlite` (testing) | Database. |
| `DB_HOST` | `db` | Host database. |
| `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | `sponsorin` | Kredensial DB. |
| `SESSION_DRIVER` | `database` | Session store. |
| `QUEUE_CONNECTION` | `database` (local) / `sync` (testing) | Queue driver. |
| `MAIL_MAILER` | `smtp` (local) / `array` (testing) | Mailer. |
| `MAIL_PORT` | `1025` | Mailpit. |
| `BCRYPT_ROUNDS` | `12` (local) / `4` (testing) | Jumlah round. |

> Jangan hardcode credential: gunakan environment variables. Dokumen verifikasi disimpan di private storage, bukan folder publik.

## 8. Keamanan dan Privasi (Ringkasan)

- Backend authorization untuk setiap resource; akses role dicek di middleware/server.
- Email verifikasi, password di-hash, proteksi CSRF/XSS/SQL injection, rate limit login.
- NIB, NPWP, dokumen verifikasi, dan catatan internal **tidak pernah** tampil di profil publik.
- Kriptografi: `business_email`, `nib`, `tax_id` dienkripsi di repa (cast `encrypted`); dokumen dienkripsi/visor.
- Audit log mencatat perubahan status verifikasi, moderasi event, penyelesaian sponsorship, dan moderasi review.
- Ulasan/ulasan: hanya sponsor pada sponsorship **Completed** yang bisa memberi ulasan; satu review per sponsorship; edit maksimal 24 jam.
- Petunjuk keamanan lengkap ada di `docs/rules/PRD_SponsorIn_v2.1_AI_Build_Ready.docx`.

## 9. Referensi

- PRD produk: `docs/rules/PRD_SponsorIn_v2.1_AI_Build_Ready.docx`
- Design system: `docs/rules/DESIGN_SYSTEM.md`
- Route (Inertia/Route): `routes/web.php`
- Middleware: `app/Http/Middleware/EnsureRole.php`, `app/Http/Middleware/EnsureSponsorActive.php`
- Enum role: `app/Enums/UserRole.php`
- Model User: `app/Models/User.php`
