import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  CalendarDays,
  Handshake,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { buttonClasses } from '../../components/Button';
import { EvidenceTag } from '../../components/StatusBadge';
import { formatDateRange } from '../../lib/utils';

const steps = [
  {
    number: '01',
    title: 'Cari fitur yang cocok',
    body: 'Gunakan filter kategori, lokasi, tanggal, dan jenis dukungan. Setiap kartu menampilkan bukti audiens, paket, dan status verifikasi EO.',
  },
  {
    number: '02',
    title: 'Baca dossier sebelum menghubungi',
    body: 'Lihat perbandingan paket, ringkasan audiens, sumber setiap angka, dan status verifikasi. Baca dulu, baru kirim minat.',
  },
  {
    number: '03',
    title: 'Simpan keputusan sementara',
    body: 'Tambahkan ke shortlist dan bandingkan beberapa posisi. Tentukan mana yang ingin dilanjutkan dan mana yang tidak.',
  },
  {
    number: '04',
    title: 'Lanjutkan dalam satu alur',
    body: 'Proposal, pengiriman, tanggapan, dan keputusan berada dalam satu riwayat yang bisa dilacak berulang kali.',
  },
];

const benefitItems = [
  {
    icon: Search,
    title: 'Cek sebelum menghubungi EO',
    body: 'Saringan kategori, lokasi, tanggal, dan kondisi dukungan diambil dari kartu event. Setiap kartu menunjukkan bukti audiens, paket, dan status verifikasi.',
  },
  {
    icon: Bookmark,
    title: 'Simpan keputusan tanpa kehilangan konteks',
    body: 'Shortlist memungkinkan Anda membandingkan beberapa peluang. Kirim minat atau proposal tanpa menumpuk informasi di chat.',
  },
  {
    icon: Handshake,
    title: 'Rasio kejelasan dan jejak kerja',
    body: 'Proposal, notifikasi, dan status pengajuan tetap terbaca. Anda selalu tahu langkah yang sedang berjalan, apa yang telah disetujui, dan yang masih menunggu.',
  },
];

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
    description: 'Jumlah tiket yang terjual. Tidak otomatis berarti hadir, karena ada sebaran tiket.',
  },
  {
    type: 'Check-in',
    description: 'Jumlah kehadiran yang tercatat saat event berlangsung, bila bukti tersedia.',
  },
];

export default function Home({ featuredEvents = [], categories = [], stats = {} }) {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-[clamp(2.6rem,6.5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-text">
                Cari peluang sponsorship tanpa basa-basi
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary-strong sm:text-lg">
                Event, paket, bukti audiens, dan status verifikasi dalam satu berkas yang rapi. Bandingkan langsung, kirim minat saat sudah siap.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <Link href="/events" className={buttonClasses({ size: 'lg' })}>
                  Lihat peluang
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/register?role=sponsor" className={buttonClasses({ size: 'lg', variant: 'outline' })}>
                  Daftar sebagai sponsor
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary-strong">
                {[
                  { icon: ShieldCheck, label: 'Bukti audiens jelas' },
                  { icon: BadgeCheck, label: 'Status terverifikasi' },
                  { icon: Handshake, label: 'Alur terdokumentasi' },
                ].map(({ icon: Icon, label }) => (
                  <p key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {label}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sponsor benefits */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Untuk sponsor</p>
              <h2 className="mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
                Dua hal yang membuat perbandingan sponsor lebih cepat.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-text-secondary-strong sm:text-base">
              Nilai utama ini ada di alur backend: filternya stabil, statusnya konsisten, dan
              masing-masing pihak hanya melihat yang berhak mengakses.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {benefitItems.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <div className="h-full rounded-[14px] border border-border bg-surface p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold leading-snug text-text">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary-strong">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="border-y border-border bg-background-muted">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-20 lg:py-24">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-medium text-primary">Cara kerja sponsor</p>
            <h2 className="mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
              Setiap langkah meninggalkan jejak yang bisa dibaca ulang.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary-strong sm:text-[15px]">
              Alur ini dirancang agar sponsor tidak perlu menghafal status dan tidak perlu
              membanjiri email atau chat dengan informasi yang sama.
            </p>
          </Reveal>

          <div>
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.06}>
                <div className="grid gap-5 border-t border-border py-7 first:border-t-0 first:pt-0 sm:grid-cols-[88px_1fr] sm:gap-8">
                  <span className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-primary tabular-nums sm:text-[2.4rem]">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold leading-snug text-text">{step.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary-strong sm:text-[15px]">
                      {step.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:py-24">
          <Reveal>
            <p className="text-sm font-medium text-primary">Transparansi data</p>
            <h2 className="mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
              Angka audiens tidak berdiri sendiri.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary-strong sm:text-[15px]">
              Setiap jenis bukti punya arti berbeda. Proyeksi, registrasi, tiket terjual, dan
              check-in tidak pernah disamakan tanpa label sumber.
            </p>
            <div className="mt-6 border-l-2 border-primary pl-4">
              <p className="text-sm font-medium leading-relaxed text-text">
                Proyeksi tidak ditampilkan sebagai kehadiran aktual.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <dl className="grid gap-4 divide-y border-border border-t">
              {evidenceRows.map((row) => (
                <div key={row.type}>
                  <dt className="text-xs font-semibold text-text-secondary-strong">{row.type}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{row.description}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Featured events */}
      {featuredEvents.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
            <Reveal className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Event yang membuka peluang</p>
                <h2 className="mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
                  Profil EO, paket, dan bukti audiens terlihat di kartu.
                </h2>
              </div>
              <Link
                href="/events"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-text"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Reveal>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event, index) => (
                <Reveal key={event.id} delay={index * 0.05}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="group flex h-full flex-col rounded-[14px] border border-border bg-surface p-5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 text-[12px]">
                      <span className="inline-flex items-center gap-1.5 font-medium text-text-secondary-strong">
                        <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                        {event.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 tabular-nums text-text-secondary-strong">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatDateRange(event.date_start, event.date_end)}
                      </span>
                    </div>

                    <h3 className="mt-4 font-semibold leading-snug tracking-[-0.02em] text-text transition-colors group-hover:text-primary">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-text-secondary-strong">
                      {event.organizer} · {event.category}
                    </p>

                    {event.audience_summary ? (
                      <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-text-secondary-strong">
                        {event.audience_summary}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-border pt-4">
                      <EvidenceTag>{event.evidence_count} bukti audiens</EvidenceTag>
                      <EvidenceTag>{event.package_count} paket</EvidenceTag>
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
      <section className="bg-primary">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16 lg:py-20">
          <Reveal>
            <h2 className="text-[clamp(1.85rem,3.6vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
              Mulai dari satu berkas yang bisa dibaca.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-background sm:text-base">
              Daftar sebagai sponsor atau EO. Verifikasi dan profil dibangun bertahap, tanpa
              mengunci akses publik.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/register?role=sponsor" className={buttonClasses({ size: 'lg', variant: 'outline' })}>
              Daftar sebagai sponsor
            </Link>
            <Link
              href="/register?role=eo"
              className="inline-flex h-12 items-center gap-1.5 rounded-[10px] border border-background/35 px-5 text-[15px] font-medium text-background transition-colors hover:bg-background/10 hover:text-white"
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
