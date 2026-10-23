import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Handshake,
  Layers,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { buttonClasses } from '../../components/Button';
import { EvidenceTag } from '../../components/StatusBadge';
import { formatDateRange, formatNumber } from '../../lib/utils';

const steps = [
  {
    number: '01',
    title: 'Telusuri peluang',
    body: 'Saring event berdasarkan kategori, wilayah, tanggal, dan jenis dukungan.',
  },
  {
    number: '02',
    title: 'Periksa berkas',
    body: 'Buka paket, deliverables, profil EO, dan setiap angka audiens beserta sumbernya.',
  },
  {
    number: '03',
    title: 'Ajukan proposal',
    body: 'Minat, proposal, dan negosiasi tercatat dalam satu riwayat yang bisa dibaca dua pihak.',
  },
  {
    number: '04',
    title: 'Konfirmasi kerja sama',
    body: 'Sponsorship aktif setelah kesepakatan disetujui sponsor dan EO.',
  },
];

const evidenceRows = [
  {
    type: 'Proyeksi',
    description: 'Perkiraan audiens dari perencanaan EO. Bukan jumlah kehadiran aktual.',
  },
  {
    type: 'Registrasi',
    description: 'Jumlah pendaftar pada periode tertentu, dengan sumber data yang disebutkan.',
  },
  {
    type: 'Tiket terjual',
    description: 'Jumlah tiket yang terjual. Tidak otomatis berarti hadir di lokasi.',
  },
  {
    type: 'Check-in',
    description: 'Jumlah kehadiran yang tercatat saat event berlangsung, bila bukti tersedia.',
  },
];

const sponsorPoints = [
  'Bandingkan event sebelum menghubungi EO.',
  'Simpan shortlist dan kelola proposal dalam satu riwayat.',
  'Beri rating hanya untuk kerja sama yang tercatat selesai.',
];

const eoPoints = [
  'Susun event, paket, dan deliverable yang jelas.',
  'Kirim proposal ke sponsor yang menerima ajuan.',
  'Tanggapi inquiry tanpa kehilangan konteks.',
];

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

/* ─ */
/*  Hero dossier                                   */
/* ─ */
function PreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-[430px]">
      <div
        aria-hidden="true"
        className="absolute -inset-x-4 bottom-5 top-6 rotate-[-2.5deg] rounded-[14px] border border-border/70 bg-surface/55"
      />
      <div
        aria-hidden="true"
        className="absolute -inset-x-2 bottom-3 top-3 rotate-[1.25deg] rounded-[14px] border border-border bg-surface/80"
      />

      <div className="relative overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-[13px] font-semibold text-text">Berkas peluang</p>
            <p className="mt-0.5 text-[11px] text-text-secondary-strong">Contoh format · angka ilustrasi</p>
          </div>
          <EvidenceTag tone="primary">Dapat diperiksa</EvidenceTag>
        </div>

        <div className="divide-y divide-border">
          <CardRow label="Audiens" tone="muted">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tabular-nums tracking-[-0.02em] text-text">1.200</span>
              <span className="text-[11px] text-text-secondary-strong">proyeksi kehadiran</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-text-secondary-strong">
              Sumber: perencanaan internal EO · periode acara
            </p>
            <div className="mt-2">
              <EvidenceTag>Belum diverifikasi</EvidenceTag>
            </div>
          </CardRow>

          <CardRow label="Paket">
            <p className="text-[13px] font-medium text-text">Media partner</p>
            <p className="mt-1 text-[11px] leading-relaxed text-text-secondary-strong">
              Panggung, konten bersama, area booth. Deliverables ditulis terpisah dari benefit.
            </p>
          </CardRow>

          <CardRow label="Organizer" tone="muted">
            <p className="text-[13px] font-medium text-text">Profil EO dan rekam jejak</p>
            <p className="mt-1 text-[11px] leading-relaxed text-text-secondary-strong">
              Rating hanya terbuka setelah sponsorship selesai dan tercatat di platform.
            </p>
          </CardRow>

          <CardRow label="Kesepakatan">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
              <p className="text-[11px] leading-relaxed text-text-secondary-strong">
                Menunggu konfirmasi sponsor dan EO. Belum menjadi sponsorship aktif.
              </p>
            </div>
          </CardRow>
        </div>

        <div className="border-t border-border bg-background-muted px-5 py-3">
          <p className="text-[11px] text-text-secondary-strong">
            Setiap baris punya status, sumber, dan pihak yang bertanggung jawab.
          </p>
        </div>
      </div>
    </div>
  );
}

function CardRow({ label, children, tone }) {
  return (
    <div
      className={`grid grid-cols-[84px_1fr] gap-4 px-5 py-4 ${tone === 'muted' ? 'bg-background-muted/35' : ''}`}
    >
      <p className="pt-0.5 text-[11px] text-text-secondary-strong">{label}</p>
      <div>{children}</div>
    </div>
  );
}

/* ─ */
/*  Stats strip                                    */
/* ─ */
function StatStrip({ stats }) {
  const items = [
    { value: stats?.events ?? 0, label: 'Event membuka peluang' },
    { value: stats?.organizers ?? 0, label: 'Organizer terdaftar' },
    { value: stats?.regions ?? 0, label: 'Wilayah tercakup' },
  ];

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-0">
          {items.map((item, index) => (
            <div
              key={item.label}
              className={
                index === 0
                  ? 'sm:pr-8'
                  : 'sm:border-l sm:border-border sm:px-8'
              }
            >
              <p className="text-[clamp(2.3rem,4.2vw,3.4rem)] font-semibold leading-none tabular-nums tracking-[-0.045em] text-text">
                {formatNumber(item.value)}
              </p>
              <p className="mt-3 max-w-[16ch] text-[13px] leading-snug text-text-secondary-strong">
                {item.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 border-t border-border pt-4 text-xs text-text-secondary-strong">
          Dihitung dari event yang sudah terbit di SponsorIn.
        </p>
      </div>
    </section>
  );
}

/*  Main page                                      */
export default function Home({ featuredEvents = [], categories = [], stats = {} }) {
  return (
    <PublicLayout>
      {/*  Hero  */}
      <section className="relative overflow-hidden border-b border-border bg-background-muted">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 lg:pb-24 lg:pt-20">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm font-medium text-primary-strong">Ruang kerja sponsorship</p>
            <h1 className="mt-4 text-[clamp(2.6rem,5.4vw,4.4rem)] font-semibold leading-[1.03] tracking-[-0.05em] text-text">
              Temukan. Hubungkan. Kolaborasikan.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-text-secondary-strong sm:text-lg">
              Data audiens, paket sponsorship, profil EO, dan riwayat kerja sama tersaji dalam satu dokumen terstruktur, transparan, dan dapat dipertanggungjawabkan.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/events" className={buttonClasses({ size: 'lg' })}>
                Jelajahi peluang
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#cara-kerja"
                className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary-strong underline decoration-border underline-offset-4 transition-colors hover:text-text"
              >
                Lihat alur kerja
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2.5 border-t border-border pt-6 text-[13px] text-text-secondary-strong">
              {[
                { icon: ShieldCheck, label: 'Sumber data tercatat' },
                { icon: BadgeCheck, label: 'Status verifikasi jelas' },
                { icon: Handshake, label: 'Persetujuan dua pihak' },
              ].map(({ icon: Icon, label }) => (
                <p key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-primary-strong" aria-hidden="true" />
                  {label}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, rotate: 1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <PreviewCard />
          </motion.div>
        </div>
      </section>

      {/* Stats  */}
      <StatStrip stats={stats} />

      {/*  Categories  */}
      {categories.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-5 py-6 sm:px-8">
            <span className="mr-2 text-[13px] text-text-secondary-strong">Kategori</span>
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category}
                href={`/events?category=${encodeURIComponent(category)}`}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-text-secondary-strong transition-colors hover:border-primary/40 hover:bg-hover hover:text-text"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/*  Alur kerja  */}
      <section id="cara-kerja" className="scroll-mt-20 border-y border-border bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-20 lg:py-24">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-medium text-primary-strong">Alur kerja</p>
            <h2 className="mt-3 text-[clamp(1.9rem,3.4vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
              Dua pihak, satu catatan kerja sama.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary-strong sm:text-[15px]">
              Setiap langkah meninggalkan jejak yang bisa dibaca ulang oleh sponsor maupun EO.
            </p>
          </Reveal>

          <div>
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.06}>
                <div className="grid grid-cols-[56px_1fr] gap-5 border-t border-border py-7 first:border-t-0 first:pt-0 sm:grid-cols-[88px_1fr] sm:gap-8">
                  <span className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-primary-soft tabular-nums sm:text-[2.4rem]">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold text-text">{step.title}</h3>
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

      {/*  Untuk Brand & EO  */}
      <section id="untuk-eo" className="scroll-mt-20 bg-background">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-medium text-primary-strong">Dua peran</p>
            <h2 className="mt-3 text-[clamp(1.9rem,3.4vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
              Cara masuk yang berbeda, standar bukti yang sama.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
            <Reveal className="lg:col-span-7">
              <div className="flex h-full flex-col rounded-[14px] border border-border bg-surface p-7 sm:p-10">
                <div className="flex items-center gap-2.5 text-[13px] font-medium text-text-secondary-strong">
                  <TrendingUp className="h-4 w-4 text-primary-strong" aria-hidden="true" />
                  Brand &amp; Sponsor
                </div>
                <h3 className="mt-4 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-tight tracking-[-0.03em] text-text">
                  Bandingkan peluang dengan data yang bisa dipertanggungjawabkan.
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary-strong sm:text-[15px]">
                  Lihat sumber setiap angka audiens, simpan kandidat, lalu ajukan proposal tanpa
                  kehilangan konteks percakapan.
                </p>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                  {sponsorPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary-strong">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-strong" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-5 lg:mt-14">
              <div className="flex h-full flex-col rounded-[14px] bg-background-muted p-7 sm:p-9">
                <div className="flex items-center gap-2.5 text-[13px] font-medium text-text-secondary-strong">
                  <Layers className="h-4 w-4 text-primary-strong" aria-hidden="true" />
                  Event Organizer
                </div>
                <h3 className="mt-4 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-tight tracking-[-0.03em] text-text">
                  Tampilkan bukti yang Anda miliki, tanpa klaim berlebihan.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary-strong">
                  Susun paket dan deliverables, lalu tanggapi minat sponsor dalam satu alur.
                </p>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                  {eoPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary-strong">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-strong" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/*  Transparansi data  */}
      <section className="border-y border-border bg-background-muted">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:py-24">
          <Reveal>
            <p className="text-sm font-medium text-primary-strong">Transparansi data</p>
            <h2 className="mt-3 text-[clamp(1.9rem,3.4vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
              Angka audiens tidak berdiri sendiri.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary-strong sm:text-[15px]">
              Setiap jenis bukti punya arti berbeda. Proyeksi, registrasi, tiket terjual, dan
              check-in tidak pernah disamakan.
            </p>
            <div className="mt-6 border-l-2 border-primary pl-4">
              <p className="text-sm font-medium leading-relaxed text-text">
                Proyeksi tidak ditampilkan sebagai kehadiran aktual.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <dl className="border-t border-border">
              {evidenceRows.map((row) => (
                <div key={row.type} className="grid gap-2 border-b border-border py-5 sm:grid-cols-[140px_1fr] sm:gap-8">
                  <dt className="text-[13px] font-semibold text-text">{row.type}</dt>
                  <dd className="text-sm leading-relaxed text-text-secondary-strong">{row.description}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/*  Featured events  */}
      {featuredEvents.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
            <Reveal className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-primary-strong">Peluang terbaru</p>
                <h2 className="mt-3 text-[clamp(1.9rem,3.4vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
                  Event yang sedang membuka peluang.
                </h2>
              </div>
              <Link
                href="/events"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary-strong transition-colors hover:text-text"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Reveal>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event, index) => {
                const featured = index === 0;

                return (
                  <Reveal
                    key={event.id}
                    delay={index * 0.05}
                    className={featured ? 'md:col-span-2 lg:col-span-2 lg:row-span-2' : ''}
                  >
                    <Link
                      href={`/events/${event.slug}`}
                      className={`group flex h-full flex-col rounded-[14px] border border-border bg-surface transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 ${
                        featured ? 'p-6 sm:p-8' : 'p-5'
                      }`}
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

                      <h3
                        className={`mt-5 font-semibold leading-snug tracking-[-0.02em] text-text transition-colors group-hover:text-primary-strong ${
                          featured ? 'text-[clamp(1.4rem,2.6vw,2.1rem)]' : 'text-[17px]'
                        }`}
                      >
                        {event.title}
                      </h3>
                      <p className={`mt-1.5 text-text-secondary-strong ${featured ? 'text-sm' : 'text-[13px]'}`}>
                        {event.organizer} · {event.category}
                      </p>

                      {featured && event.audience_summary ? (
                        <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-secondary-strong line-clamp-3">
                          {event.audience_summary}
                        </p>
                      ) : null}

                      <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                        <EvidenceTag>{event.evidence_count} bukti audiens</EvidenceTag>
                        <EvidenceTag>{event.package_count} paket</EvidenceTag>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/*  CTA  */}
      <section className="bg-primary-strong">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16 lg:py-20">
          <Reveal>
            <h2 className="text-[clamp(1.85rem,3.4vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
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
