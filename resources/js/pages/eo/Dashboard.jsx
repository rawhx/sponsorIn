import { Head, Link } from '@inertiajs/react';
import { FilePlus2, FileText, Handshake, Star, Users } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { formatDate } from '../../lib/utils';

export default function EoDashboard({ organization, counts = {}, upcomingEvents = [] }) {
  const statusRows = [
    { label: 'Total Proposal', value: counts.proposals_total ?? 0, description: 'Semua proposal yang dibuat.' },
    { label: 'Proposal Terbit', value: counts.proposals_published ?? 0, description: 'Bisa dilihat oleh semua sponsor.' },
    { label: 'Draft Proposal', value: counts.proposals_draft ?? 0, description: 'Belum dipublikasikan.' },
    { label: 'Peminat (Sponsor)', value: counts.proposals_interest ?? 0, description: 'Sponsor yang merespons proposal terbit.' },
  ];

  return (
    <DashboardLayout
      eyebrow={organization?.name ?? 'Akun EO'}
      title="Dashboard EO"
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href="/eo/proposals/create" className={buttonClasses({ size: 'sm' })}>
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            Upload Proposal
          </Link>
          <Link href="/eo/proposals" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
            <FileText className="h-4 w-4" aria-hidden="true" />
            Daftar Proposal
          </Link>
          <Link href="/eo/sponsorships" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
            <Handshake className="h-4 w-4" aria-hidden="true" />
            Manajemen Kerja Sama
          </Link>
        </div>
      }
    >
      <Head title="Dashboard EO" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="rounded-[12px] border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs font-medium tracking-[0.06em] text-text-muted">RINGKASAN PROPOSAL</p>
            <h2 className="mt-1.5 text-lg font-semibold text-text">Proposal & Peminat</h2>
          </div>
          <div className="divide-y divide-border">
            {statusRows.map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-text">{row.label}</p>
                  <p className="mt-0.5 text-xs text-text-secondary-strong">{row.description}</p>
                </div>
                <p className="text-lg font-semibold tabular-nums text-text">{row.value}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border bg-background-muted px-5 py-3">
            <p className="text-xs leading-relaxed text-text-secondary-strong">
              Kerja Sama Aktif: {counts.sponsorships_active ?? 0}
            </p>
          </div>
        </section>

        <section className="rounded-[12px] border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs font-medium tracking-[0.06em] text-text-muted">PROFIL EO</p>
            <h2 className="mt-1.5 text-lg font-semibold text-text">{organization.name}</h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-text-secondary-strong">
              {organization.description || 'Tambahkan deskripsi organisasi agar sponsor memahami fokus dan rekam jejak Anda.'}
            </p>
            <div className="mt-4 border-t border-border pt-3 text-sm">
              <p className="text-xs text-text-muted">Lokasi</p>
              <p className="mt-0.5 text-text-secondary-strong">{organization.location || 'Belum diisi'}</p>
            </div>
            <div className="mt-3 flex items-start gap-2 border-t border-border pt-3">
              <Star className="mt-0.5 h-4 w-4 text-text-muted" aria-hidden="true" />
              {organization.review_count > 0 ? (
                <p className="text-sm text-text-secondary-strong">
                  <span className="font-medium tabular-nums text-text">{Number(organization.rating_average).toFixed(1)} / 5</span>{' '}
                  dari {organization.review_count} ulasan kerja sama selesai.
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-text-secondary-strong">
                  Belum ada ulasan. Rating hanya berasal dari sponsorship yang tercatat selesai.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
          <h2 className="text-sm font-semibold text-text">Event mendatang</h2>
          <p className="text-xs text-text-muted">{upcomingEvents.length} event</p>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="divide-y divide-border">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="grid gap-2 py-4 sm:grid-cols-[150px_1fr_auto] sm:items-center sm:gap-6">
                <p className="text-sm tabular-nums text-text-secondary-strong">{formatDate(event.date_start)}</p>
                <div>
                  <p className="text-sm font-medium text-text">{event.title}</p>
                  <p className="mt-0.5 text-xs text-text-secondary-strong">{event.location}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-5"
            illustration="calendar"
            title="Belum ada event mendatang"
            description="Event yang Anda buat akan muncul di sini. Mulai dengan menambahkan event pertama, lengkapi bukti audiens, lalu kirim untuk moderasi."
            action={<Link href="/eo/events/create" className={buttonClasses()}>Buat event</Link>}
          />
        )}
      </section>
    </DashboardLayout>
  );
}
