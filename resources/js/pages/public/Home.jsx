import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  FileText,
  Handshake,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { buttonClasses } from '../../components/Button';
import { EvidenceTag } from '../../components/StatusBadge';
import { formatDateRange } from '../../lib/utils';

const evidenceRows = [
  {
    type: 'Proyeksi',
    description: 'Perkiraan audiens dari perencanaan EO. Bukan jumlah kehadiran aktual di lokasi.',
  },
  {
    type: 'Registrasi',
    description: 'Jumlah pendaftar pada periode tertentu, dengan sumber data yang disebutkan.',
  },
  {
    type: 'Tiket terjual',
    description: 'Jumlah tiket yang terjual secara nyata sebelum pelaksanaan event.',
  },
  {
    type: 'Check-in',
    description: 'Jumlah kehadiran aktual yang tercatat saat event berlangsung di lokasi.',
  },
];

export default function Home({ featuredEvents = [], categories = [], stats = {} }) {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs mb-4">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Platform Kolaborasi Sponsorship Terverifikasi
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Temukan kerja sama sponsorship yang siap dieksekusi.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                SponsorIn mempertemukan EO yang memiliki event berkualitas dengan brand sponsor relevan. Lengkap dengan proposal resmi, verifikasi identitas, dan ruang negosiasi terpusat.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/register" className={buttonClasses({ size: 'lg' })}>
                  Mulai Sekarang
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/events" className={buttonClasses({ size: 'lg', variant: 'outline' })}>
                  Jelajahi Event
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm font-medium text-slate-600">
                {[
                  { icon: ShieldCheck, label: 'Bukti audiens terverifikasi' },
                  { icon: BadgeCheck, label: 'Legalitas usaha terperiksa' },
                  { icon: Handshake, label: 'Jejak kesepakatan tertata' },
                ].map(({ icon: Icon, label }) => (
                  <p key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {label}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>

          <Reveal className="relative">
            <div className="rounded-3xl border border-emerald-600/20 bg-gradient-to-br from-emerald-700 to-emerald-900 p-7 text-white shadow-xl sm:p-9">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">Ruang Kerja Sponsorship</p>
                  <p className="mt-2 text-2xl font-bold leading-tight text-white">
                    Dari proposal pertama hingga kerja sama tuntas tercatat.
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xs text-white">
                  <Handshake className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
                <Stat value={stats.events ?? 0} label="Event Aktif" />
                <Stat value={stats.organizers ?? 0} label="Penyelenggara" />
                <Stat value={stats.regions ?? 0} label="Kota & Wilayah" />
              </div>
              {categories.length > 0 ? (
                <div className="mt-6 rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-emerald-100">
                  <span className="font-semibold text-white">Kategori populer:</span> {categories.slice(0, 3).join(' · ')}
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="border-b border-slate-200 bg-slate-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Alur Kerja</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Satu alur terintegrasi, transparan untuk kedua pihak.
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              EO mempublikasikan event, sponsor menemukan kecocokan dan merespons. Seluruh negosiasi hingga penyelesaian terekam rapi.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', icon: FileText, title: 'EO Unggah Event', body: 'Lengkapi dossier event, tentukan paket sponsorship, serta sertakan data estimasi audiens.' },
              { step: '02', icon: Users, title: 'Sponsor Menemukan', body: 'Sponsor menelusuri katalog peluang, membandingkan demografi, lalu mengajukan minat.' },
              { step: '03', icon: Handshake, title: 'Diskusi & Negosiasi', body: 'Koordinasi klausul kontrak dan hak promosi melalui ruang obrolan kerja sama terpadu.' },
              { step: '04', icon: BadgeCheck, title: 'Selesai & Evaluasi', body: 'Konfirmasi bukti penyelesaian kewajiban dan berikan ulasan reputasi yang obyektif.' },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold tabular-nums text-slate-400">{item.step}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For EO */}
      <section id="untuk-eo" className="scroll-mt-20 border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Untuk Event Organizer</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Jangkau sponsor kredibel tanpa repot penawaran door-to-door.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                Cukup publikasikan profil event dan paket sponsorship Anda. Proposal Anda dapat diakses langsung oleh seluruh brand sponsor yang aktif di ekosistem SponsorIn.
              </p>
              <ul className="mt-6 space-y-3.5 text-sm text-slate-700 font-medium">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">✓</span>
                  Satu formulir terstruktur untuk profil event, paket, dan data penonton
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">✓</span>
                  Bisa simpan draf rancangan sebelum dikirim untuk moderasi
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">✓</span>
                  Kelola peminat dan ruang obrolan kerja sama di dashboard terpusat
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/register?role=eo" className={buttonClasses({ size: 'lg' })}>
                  Daftar sebagai Penyelenggara Event
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8 shadow-xs">
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Alur Pengelolaan EO</p>
              <div className="mt-5 divide-y divide-slate-200">
                {[
                  { title: '1. Buat & Kelola Event', body: 'Rincikan informasi event, tanggal mulai/selesai, venue, dan target segmen penonton.' },
                  { title: '2. Lampirkan Bukti Audiens', body: 'Sertakan tautan proyeksi, jumlah pendaftar, atau rekam jejak event sebelumnya.' },
                  { title: '3. Tanggapi Minat Sponsor', body: 'Diskusikan penawaran khusus dan kunci kesepakatan dengan brand mitra.' },
                ].map((item) => (
                  <div key={item.title} className="py-4 first:pt-0 last:pb-0">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Sponsor */}
      <section id="untuk-sponsor" className="scroll-mt-20 border-b border-slate-200 bg-slate-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Alur Keputusan Sponsor</p>
                <div className="mt-5 divide-y divide-slate-100">
                  {[
                    { title: '1. Telusuri Katalog Peluang', body: 'Filter berdasarkan kota, rentang tanggal, kategori event, dan jenis dukungan.' },
                    { title: '2. Bandingkan Dossier', body: 'Simpan ke shortlist untuk menganalisis rasio biaya terhadap proyeksi pengunjung.' },
                    { title: '3. Ajukan Minat & Negosiasi', body: 'Kirim respons proposal dan koordinasikan hak aktivasi brand secara langsung.' },
                  ].map((item) => (
                    <div key={item.title} className="py-4 first:pt-0 last:pb-0">
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Untuk Brand Sponsor</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Temukan event relevan dengan transparansi data yang jelas.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                Pilih proposal event yang tepat untuk target pasar Anda tanpa membuang waktu menyortir proposal acak. Verifikasi usaha melindungi brand Anda dalam setiap tahapan kerja sama.
              </p>
              <ul className="mt-6 space-y-3.5 text-sm text-slate-700 font-medium">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">✓</span>
                  Akses langsung ke ratusan proposal terkurasi dari berbagai daerah
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">✓</span>
                  Bandingkan beberapa event lewat fitur Shortlist
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">✓</span>
                  Ruang kerja bergaransi dengan riwayat pertukaran pesan yang terdokumentasi
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/register?role=sponsor" className={buttonClasses({ size: 'lg' })}>
                  Daftar sebagai Brand Sponsor
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured events */}
      {featuredEvents.length > 0 && (
        <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Peluang Sponsorship Terbuka</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Event pilihan siap kerja sama.
                </h2>
              </div>
              <Link
                href="/events"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
              >
                Lihat Semua Event
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event, index) => (
                <Reveal key={event.id} delay={index * 0.05}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                          {event.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                          <CalendarDays className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                          {formatDateRange(event.date_start, event.date_end)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {event.organizer} · <span className="text-emerald-700 font-semibold">{event.category}</span>
                      </p>

                      {event.audience_summary ? (
                        <p className="mt-3 line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                          {event.audience_summary}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      <EvidenceTag>{event.evidence_count} Bukti Audiens</EvidenceTag>
                      <EvidenceTag>{event.package_count} Paket Dukungan</EvidenceTag>
                      {event.support_needs ? <EvidenceTag>{event.support_needs}</EvidenceTag> : null}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-800 to-emerald-950 py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Siap memulai kolaborasi sponsorship yang lebih terarah?
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-emerald-100 max-w-xl">
              Daftarkan brand Anda untuk menemukan peluang sponsorship berkualitas, atau publikasikan event Anda untuk terhubung langsung dengan ratusan sponsor potensial.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/register?role=sponsor" className={buttonClasses({ size: 'lg', variant: 'outline' })}>
              Daftar sebagai Sponsor
            </Link>
            <Link
              href="/register?role=eo"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              Daftar sebagai EO
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  );
}

function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-3xl font-extrabold tabular-nums text-white">{value}</p>
      <p className="mt-1 text-xs text-emerald-200 font-medium">{label}</p>
    </div>
  );
}
