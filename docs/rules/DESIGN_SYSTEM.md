# Design System — Sponsor & EO Collaboration Platform

> Dokumen acuan resmi untuk implementasi dan perubahan UI. Coding agent harus membaca dokumen ini sebelum membuat atau mengubah tampilan agar seluruh halaman konsisten.

## 1. Tujuan Produk

Platform ini mempertemukan Event Organizer (EO), organisasi, komunitas, dan brand untuk menemukan peluang sponsor serta mengelola proses kolaborasi.

Alur utama yang harus didukung:
- Menemukan dan membandingkan sponsor.
- Melihat profil, preferensi, dan persyaratan sponsorship.
- Mengirim serta melacak proposal.
- Melihat riwayat pengajuan dan komunikasi.
- Menerima notifikasi.
- Mengelola jadwal event dan mendeteksi potensi benturan tanggal.

Desain harus membantu pengguna menyelesaikan tugas dengan mudah. Jangan mengorbankan kejelasan hanya demi estetika.

## 2. Prinsip Visual

Arah visual: **Soft Minimalist × Modern Editorial**.

Karakter yang dituju:
- Bersih, lembut, tenang, dan modern.
- Profesional tetapi tetap ramah.
- Memiliki identitas visual tanpa warna mencolok atau kontras berlebihan.
- Menggunakan tipografi, whitespace, dan komposisi sebagai pembentuk karakter.
- Terstruktur dan mudah dipindai, terutama pada halaman yang berisi banyak data.

Hindari:
- Warna neon, sangat jenuh, atau kontras keras.
- Background hitam pekat sebagai elemen dominan.
- Gradient dekoratif yang tidak memiliki fungsi.
- Glassmorphism/neumorphism berlebihan.
- Shadow tebal pada setiap card.
- Card dengan radius terlalu besar di semua tempat.
- Terlalu banyak badge berwarna.
- Animasi berlebihan, ornamen acak, dan layout dashboard generik.
- Membuat setiap section terlihat seperti card terpisah tanpa kebutuhan UX.

## 3. Design Tokens

Gunakan token berikut sebagai sumber kebenaran visual. Jangan mengganti nilainya secara lokal tanpa alasan kuat dan persetujuan yang konsisten.

### 3.1 Color palette

| Token | Hex | Fungsi |
|---|---|---|
| `--color-background` | `#F5F4EF` | Background utama bernuansa warm off-white |
| `--color-background-muted` | `#E7E8DF` | Area sekunder yang lembut |
| `--color-surface` | `#FFFFFF` | Surface kartu, dialog, dan form |
| `--color-primary` | `#75836A` | Aksen utama muted sage |
| `--color-primary-soft` | `#AAB49D` | Aksen lembut dan dekorasi fungsional |
| `--color-text` | `#343B32` | Teks utama |
| `--color-text-secondary` | `#777B72` | Teks pendukung |
| `--color-text-muted` | `#92958B` | Metadata dan teks tersier |
| `--color-border` | `#DEDFD5` | Border dan divider |
| `--color-hover` | `#ECEDE5` | Hover pada surface netral |
| `--color-success` | `#66816A` | Status berhasil |
| `--color-warning` | `#A98656` | Status menunggu/perhatian |
| `--color-danger` | `#B87373` | Status gagal/ditolak |
| `--color-info` | `#7B8D9B` | Informasi netral |

Catatan:
- Palet di atas adalah arah warna brand utama, bukan izin untuk memakai semua warna sekaligus.
- Gunakan `--color-primary` secara hemat untuk tombol utama, navigasi aktif, link penting, dan elemen yang perlu penekanan.
- Status harus tetap dapat dipahami melalui teks atau ikon, bukan warna saja.
- Warna lembut tidak boleh mengorbankan keterbacaan. Uji contrast ratio untuk teks, tombol, dan focus state; sesuaikan warna foreground bila diperlukan tanpa mengubah karakter palet.
- Hindari memakai `#75836A` sebagai teks kecil di atas putih jika kontrasnya tidak memadai. Pilih foreground yang lebih gelap atau surface yang sesuai.

### 3.2 Semantic usage

Gunakan token berdasarkan peran, bukan berdasarkan nama warna.

Contoh:
- Background halaman: `background`
- Area section alternatif: `background-muted`
- Card/form/modal: `surface`
- Heading dan teks utama: `text`
- Deskripsi dan metadata: `text-secondary` atau `text-muted`
- Garis pemisah: `border`
- Tombol utama: `primary` dengan foreground yang lolos uji kontras
- Hover netral: `hover`
- Status proposal: `success`, `warning`, `danger`, atau `info`

Jangan menulis hex langsung di komponen jika token yang sesuai sudah tersedia.

### 3.3 CSS variables starter

Adaptasikan ke arsitektur proyek yang sudah ada. Jangan membuat konfigurasi kedua jika sistem token serupa sudah tersedia.

```css
:root {
  color-scheme: light;

  --color-background: #F5F4EF;
  --color-background-muted: #E7E8DF;
  --color-surface: #FFFFFF;
  --color-primary: #75836A;
  --color-primary-soft: #AAB49D;
  --color-text: #343B32;
  --color-text-secondary: #777B72;
  --color-text-muted: #92958B;
  --color-border: #DEDFD5;
  --color-hover: #ECEDE5;
  --color-success: #66816A;
  --color-warning: #A98656;
  --color-danger: #B87373;
  --color-info: #7B8D9B;

  --font-sans: "Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 14px;

  --border-width: 1px;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
}
```

Jangan menambahkan dark theme secara otomatis jika produk belum membutuhkannya. Jika dark theme memang sudah ada, petakan token semantic ke tema gelap tanpa mengubah kontrak token komponen.

## 4. Typography

Font yang disarankan: **Plus Jakarta Sans**. Jika proyek sudah menggunakan font lain yang terbaca dan konsisten, pertahankan kecuali ada alasan jelas untuk menggantinya.

Panduan:
- Gunakan ukuran heading yang terukur dan tidak berlebihan.
- Gunakan font weight regular/medium untuk sebagian besar UI.
- Gunakan bold untuk penekanan yang memang penting.
- Jaga line-height body text sekitar `1.5–1.7`.
- Batasi lebar paragraf panjang agar mudah dibaca.
- Metadata harus lebih kecil, tetapi tetap terbaca.
- Hindari terlalu banyak ukuran font yang hampir sama.

Skala awal yang dapat diadaptasi:
- Display/hero: `clamp(2.25rem, 4vw, 3.75rem)`
- H1: `2rem–2.5rem`
- H2: `1.5rem–1.875rem`
- H3: `1.125rem–1.25rem`
- Body: `1rem`
- Supporting: `0.875rem`
- Caption: `0.75rem` hanya untuk metadata yang tetap terbaca

Jangan menerapkan skala ini secara kaku jika komposisi dan kebutuhan responsif membutuhkan penyesuaian.

## 5. Spacing dan Layout

- Gunakan sistem spacing berbasis kelipatan `4px`.
- Nilai utama: `4, 8, 12, 16, 24, 32, 48, 64px`.
- Gunakan whitespace yang cukup tetapi tetap efisien.
- Selaraskan konten menggunakan grid dan container yang konsisten.
- Tentukan lebar konten berdasarkan jenis halaman.
- Hindari margin/padding arbitrer yang menyebabkan halaman terasa tidak seragam.
- Pastikan layout tidak overflow secara horizontal pada layar kecil.
- Pada halaman padat data, prioritaskan keterbacaan dan efisiensi dibanding whitespace berlebihan.

## 6. Radius, Border, Shadow, dan Icon

### Radius
- Input dan kontrol kecil: `8px`.
- Tombol dan card standar: `10–12px`.
- Panel besar/modal: maksimal sekitar `14px`, kecuali pola produk yang sudah ada membutuhkan berbeda.

### Border
- Gunakan border `1px` dengan token `border`.
- Border harus membantu pengelompokan, bukan membingkai setiap elemen.
- Divider dibuat halus dan konsisten.

### Shadow
- Default: tanpa shadow atau shadow sangat halus.
- Gunakan elevation hanya untuk elemen yang memang mengambang, misalnya dropdown, popover, dan modal.
- Jangan memberikan shadow besar ke seluruh card.

### Icon
- Gunakan satu keluarga icon, misalnya Lucide.
- Samakan ukuran dan stroke secara konsisten.
- Icon harus membantu pemahaman; jangan menambahkan icon dekoratif pada setiap label.

## 7. Komponen dan Perilakunya

### Buttons
Sediakan variant yang memang dibutuhkan:
- Primary: aksi utama.
- Secondary: aksi pendamping.
- Outline: aksi netral yang perlu batas.
- Ghost: aksi ringan.
- Destructive: aksi berisiko.

Aturan:
- Tinggi target sekitar `40–48px`, disesuaikan dengan density.
- Padding horizontal konsisten.
- Label singkat dengan kata kerja yang jelas.
- Hover, active, disabled, loading, dan focus state harus tersedia.
- Jangan menggunakan warna primary untuk semua tombol dalam satu halaman.
- Pastikan warna teks tombol memiliki kontras yang cukup.

### Forms
- Label harus selalu jelas; jangan hanya mengandalkan placeholder.
- Tampilkan validasi dekat dengan field terkait.
- Error message harus spesifik dan membantu.
- Bedakan required, optional, disabled, dan read-only.
- File upload harus menjelaskan format/ukuran yang didukung jika relevan.
- Gunakan focus ring yang terlihat dan konsisten.

### Cards
- Gunakan card untuk mengelompokkan informasi yang memang berhubungan.
- Prioritaskan judul, deskripsi, metadata, dan tindakan penting.
- Gunakan surface putih, border halus, dan radius moderat.
- Hindari card bertingkat di dalam card tanpa alasan UX.

### Badges dan status
- Status proposal dapat berupa Draft, Submitted, Under Review, Needs Revision, Approved, Declined, atau Cancelled sesuai status yang didukung sistem.
- Gunakan warna status secara konsisten dan jangan mengarang status yang tidak ada di backend.
- Sertakan teks status; warna bukan satu-satunya penanda.
- Hindari badge yang terlalu besar atau terlalu mencolok.

### Navigation
- Navigasi harus sederhana, konsisten, dan mudah dipahami.
- Active state memakai aksen muted yang jelas tetapi tidak agresif.
- Jangan menggunakan warna berbeda untuk setiap menu.
- Pada layar kecil, pastikan navigasi tetap mudah dijangkau dan tidak menutupi konten.

### Feedback states
Setiap alur penting harus memiliki loading, empty, error, success, disabled, dan state validasi yang relevan.
Pesan harus menjelaskan keadaan serta langkah berikutnya bila memungkinkan.

## 8. Panduan UX untuk Fitur Produk

### Sponsor discovery
- Pencarian dan filter harus mudah ditemukan.
- Informasi kartu sponsor harus mudah dibandingkan.
- Tampilkan kategori, kecocokan, persyaratan, atau peluang hanya jika data tersedia.
- Jangan mengarang rating, jumlah peluang, status verifikasi, atau statistik.

### Sponsor profile
- Susun informasi brand dan persyaratan sponsorship secara terstruktur.
- Bedakan informasi utama dengan metadata.
- CTA pengajuan harus jelas dan tidak mendominasi seluruh halaman.

### Proposal submission
- Gunakan urutan field yang logis.
- Jelaskan format dokumen yang diterima.
- Pertahankan input saat validasi gagal jika memungkinkan.
- Tampilkan status pengiriman dan konfirmasi yang jelas.
- Jangan mengubah business logic atau kontrak API demi penyesuaian UI.

### Application history
- Gunakan status dan timeline yang mudah dipindai.
- Tampilkan tanggal dan aktivitas sesuai data yang benar-benar tersedia.
- Jangan menyimpulkan bahwa proposal dibaca, diterima, atau ditolak tanpa status resmi.

### Notifications
- Bedakan notifikasi sudah/belum dibaca secara halus.
- Prioritaskan kejelasan isi dan tindakan lanjutan.
- Hindari badge angka atau warna yang tidak memiliki makna.

### Calendar dan konflik jadwal
- Gunakan penanda yang konsisten untuk event dan potensi konflik.
- Sertakan teks atau detail yang menjelaskan konflik; jangan hanya mengandalkan warna.
- Pertahankan perilaku tanggal, timezone, dan validasi yang sudah diterapkan aplikasi.

## 9. Responsive Design

- Mobile-first, lalu adaptasi ke tablet dan desktop.
- Uji setidaknya pada lebar sekitar `360px`, `768px`, `1024px`, dan `1440px`.
- Hindari horizontal scrolling yang tidak diperlukan.
- Form harus nyaman digunakan dengan sentuhan.
- Card/grid harus berubah jumlah kolom sesuai ruang yang tersedia.
- Tabel padat dapat memakai pola responsive yang sesuai tanpa menghilangkan informasi penting.
- Dialog pada mobile tidak boleh keluar dari viewport.

## 10. Accessibility

Targetkan WCAG 2.2 AA sejauh relevan:
- Periksa contrast ratio teks dan kontrol interaktif.
- Sediakan keyboard navigation dan focus indicator.
- Gunakan elemen HTML semantik.
- Setiap input memiliki label yang dapat diakses.
- Tombol memiliki nama aksi yang jelas.
- Status dan error tidak dibedakan melalui warna saja.
- Hormati `prefers-reduced-motion`.
- Jangan menghilangkan outline focus tanpa pengganti yang memadai.

Palet yang soft tidak berarti kontras teks boleh terlalu rendah. Jika token warna tidak lolos kontras, pilih pasangan foreground/background yang lebih terbaca sambil mempertahankan nuansa warna.

## 11. Aturan Implementasi untuk Vibe Coding Agent

**Baca dokumen ini sebelum mengubah tampilan apa pun.** Dokumen ini menjadi acuan utama UI/UX untuk repository.

Sebelum mengimplementasikan:
1. Periksa struktur proyek, framework, dependency, design token, komponen, dan halaman yang sudah ada.
2. Cari apakah token atau komponen serupa sudah tersedia; gunakan kembali jika memungkinkan.
3. Pahami konteks halaman dan alur pengguna sebelum mengubah desain.
4. Identifikasi komponen yang dapat digunakan ulang.

Saat mengimplementasikan:
1. Gunakan design token semantic, bukan hex hardcoded di komponen.
2. Reuse komponen yang ada dan buat komponen baru hanya bila diperlukan.
3. Ikuti pola penamaan, struktur folder, framework, dan versi library yang sudah dipakai.
4. Pertahankan business logic, API contract, autentikasi, validasi, dan perilaku fitur.
5. Jangan mengganti data nyata dengan mock data.
6. Jangan mengubah halaman atau modul yang tidak berkaitan dengan tugas.
7. Jangan menambahkan dependency baru tanpa kebutuhan yang jelas.
8. Terapkan responsive behavior dan semua state interaksi yang relevan.
9. Jangan mengubah token inti hanya untuk menyelesaikan satu kasus lokal; evaluasi solusi yang konsisten untuk seluruh sistem.

Setelah mengimplementasikan:
1. Periksa hasil pada mobile, tablet, dan desktop.
2. Pastikan warna, typography, spacing, radius, border, dan tombol konsisten.
3. Periksa state hover, focus, active, disabled, loading, empty, error, dan success yang relevan.
4. Jalankan lint, typecheck, test, atau build yang tersedia jika memungkinkan.
5. Perbaiki regression yang muncul.
6. Laporkan file yang diubah, komponen yang digunakan ulang, pemeriksaan yang dilakukan, dan hal yang belum dapat diverifikasi.

Jika suatu kebutuhan tidak diatur secara eksplisit di dokumen ini, ikuti pola yang sudah ada dan pilih solusi paling sederhana yang konsisten dengan prinsip Soft Minimalist × Modern Editorial. Jangan membuat gaya visual baru tanpa alasan.

## 12. Definition of Done

Implementasi dianggap selesai jika:
- [ ] Tampilan mengikuti palet dan token design system.
- [ ] Tidak ada warna hardcoded baru ketika token yang sesuai tersedia.
- [ ] Typography dan spacing konsisten.
- [ ] Komponen mengikuti variant dan state yang sudah ditetapkan.
- [ ] Tampilan responsif dan tidak overflow.
- [ ] Informasi status tetap jelas tanpa bergantung pada warna.
- [ ] Kontras dan keyboard focus telah diperiksa.
- [ ] Business logic dan integrasi yang sudah ada tetap berfungsi.
- [ ] Pemeriksaan teknis yang tersedia sudah dijalankan atau keterbatasannya dilaporkan.
- [ ] Perubahan yang dibuat tetap dalam ruang lingkup tugas.

---

**Ringkasan identitas visual:** warm off-white `#F5F4EF`, muted sage `#75836A`, soft sage `#AAB49D`, charcoal green `#343B32`, neutral border `#DEDFD5`; tipografi yang rapi, whitespace terukur, border halus, shadow minimal, dan UI yang terasa tenang serta profesional.
