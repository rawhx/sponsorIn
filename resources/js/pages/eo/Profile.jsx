import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bookmark, CalendarDays, FileText, MapPin, Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { EvidenceTag } from '../../components/StatusBadge';
import { formatDate, formatDateRange, formatNumber, legalFormLabels, proposalPreferenceLabels } from '../../lib/utils';

export default function EoProfile({
  organization,
  verifications,
  currentVerification,
  events,
  eventsCount,
  publishedEventsCount,
  reviews,
  totalRatings,
  averageRating,
}) {
  const active = verifications?.filter((v) => v.status === 'approved').length ?? 0;
  const pending = verifications?.filter((v) => v.status !== 'approved').length ?? 0;

  return (
    <DashboardLayout
      eyebrow="Profil Event Organizer"
      title="Profil publik"
      actions={
        <Link href="/eo/dashboard" className={buttonClasses({ variant: 'outline' })}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke ringkasan
        </Link>
      }
    >
      <Head title="Profil publik" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div>
          <section className="rounded-[12px] border border-border bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-[0.06em] text-text-muted">EVENT ORGANIZER</p>
                <h1 className="mt-1.5 text-2xl font-semibold leading-tight text-text">{organization?.name ?? 'Belum diisi'}</h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary-strong">
                  {organization?.description ?? 'Profil ini masih kosong. Tambahkan deskripsi dan buat event untuk menampilkan potensi di platform.'}
                </p>
              </div>
              {(organization?.rating_average ?? null) !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-text">{organization.rating_average ?? '—'}</span>
                  <Star className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  <span className="text-xs tabular-nums text-text-secondary-strong">{organization.review_count ?? 0} ulasan</span>
                </div>
              ) : null}
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs text-text-muted">Lokasi</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization?.location ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Kategori</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization?.category ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Bentuk hukum</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization?.legal_form ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Preferensi proposal</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{proposalPreferenceLabels[organization?.proposal_preference] ?? '—'}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              {active > 0 ? (
                <StatusBadge status={`approved-${active}`}>{active} verifikasi disetujui</StatusBadge>
              ) : null}
              {pending > 0 ? (
                <StatusBadge status="pending">{pending} permintaan sedang diproses</StatusBadge>
              ) : null}
              {active > 0 || pending > 0 ? null : (
                <StatusBadge status="neutral">Belum ada verifikasi</StatusBadge>
              )}
            </div>
          </section>

          {eventsCount > 0 ? (
            <section className="mt-6 rounded-[12px] border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-text">Event yang dipublikasikan</h2>
                <span className="text-xs tabular-nums text-text-secondary-strong">{publishedEventsCount} terbit</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div key={event.id} className="rounded-[8px] border border-border bg-background-muted p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-xs font-medium text-text">{event.title}</h3>
                      <StatusBadge status="published" />
                    </div>
                    <p className="mt-1 text-xs text-text-secondary-strong">{event.location}</p>
                    <p className="mt-1 text-[11px] text-text-muted">{formatDateRange(event.date_start, event.date_end)}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Profil</h2>
            <dl className="mt-3 divide-y divide-border">
              <div className="flex items-start gap-3 py-3">
                <FileText className="mt-1 h-4 w-4 text-text-muted" aria-hidden="true" />
                <div>
                  <p className="text-xs text-text-muted">Deskripsi</p>
                  <p className="mt-1 text-sm text-text-secondary-strong">{organization?.description ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <MapPin className="mt-1 h-4 w-4 text-text-muted" aria-hidden="true" />
                <div>
                  <p className="text-xs text-text-muted">Lokasi</p>
                  <p className="mt-1 text-sm text-text-secondary-strong">{organization?.location ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <span className="h-4 w-4 text-text-muted" aria-hidden="true"></span>
                <div>
                  <p className="text-xs text-text-muted">Bentuk hukum</p>
                  <p className="mt-1 text-sm text-text-secondary-strong">{legalFormLabels[organization?.legal_form] ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <span className="h-4 w-4 text-text-muted" aria-hidden="true"></span>
                <div>
                  <p className="text-xs text-text-muted">Preferensi proposal</p>
                  <p className="mt-1 text-sm text-text-secondary-strong">{proposalPreferenceLabels[organization?.proposal_preference] ?? '—'}</p>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-[12px] border border-border bg-background-muted p-5">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary-strong" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text">Rating</h2>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-text">{averageRating ?? 'Belum ada ulasan'}</span>
              <Star className="h-4 w-4 text-text-muted" aria-hidden="true" />
            </div>
            <p className="mt-1 text-xs text-text-secondary-strong">{totalRatings ?? 0} ulasan dari sponsor</p>
          </div>

          {active > 0 ? (
            <div className="rounded-[12px] border border-border bg-background-muted p-5">
              <h2 className="text-sm font-semibold text-text">Verifikasi yang disetujui</h2>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                {active} of {verifications?.length ?? 0} pengajuan terverifikasi. Verifikasi adalah histori status usaha, bukan jaminan kelayakan.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </DashboardLayout>
  );
}
