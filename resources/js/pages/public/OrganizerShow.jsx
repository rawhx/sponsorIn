import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, MapPin, Star } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { EvidenceTag } from '../../components/StatusBadge';
import ReportDialog from '../../components/ReportDialog';
import { formatDateRange } from '../../lib/utils';

export default function OrganizerShow({ organizer, events }) {
  const { auth } = usePage().props;
  const canReport =
    ['sponsor', 'eo'].includes(auth?.user?.role) && auth?.user?.email_verified && auth?.organization?.id !== organizer.id;

  return (
    <PublicLayout>
      <Head title={`${organizer.name} · Pelaku event`} />
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <Link href="/organizers" className="inline-flex items-center gap-2 text-sm text-text-secondary-strong hover:text-text">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Semua pelaku event
        </Link>

        <div className="mt-7 grid gap-8 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-border bg-background-muted">
                <Building2 className="h-6 w-6 text-primary-strong" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-tight tracking-[-0.035em] text-text">
                  {organizer.name}
                </h1>
                {organizer.location ? (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-secondary-strong">
                    <MapPin className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    {organizer.location}
                  </p>
                ) : null}
              </div>
            </div>
            {organizer.description ? (
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-text-secondary-strong">{organizer.description}</p>
            ) : null}
          </div>

          <aside className="rounded-[12px] border border-border bg-background-muted p-5">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-text-secondary-strong">Event aktif</dt>
                <dd className="font-medium tabular-nums text-text">{organizer.event_count}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                <dt className="text-text-secondary-strong">Status</dt>
                <dd>
                  {organizer.verified ? (
                    <span className="inline-flex items-center gap-1 text-success-strong">
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                      Terverifikasi
                    </span>
                  ) : (
                    <span className="text-text-secondary-strong">Belum terverifikasi</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                <dt className="text-text-secondary-strong">Ulasan</dt>
                <dd>
                  {organizer.review_count > 0 ? (
                    <span className="inline-flex items-center gap-1 font-medium tabular-nums text-text">
                      <Star className="h-4 w-4 text-warning-strong" aria-hidden="true" />
                      {Number(organizer.rating_average).toFixed(1)} / 5 ({organizer.review_count})
                    </span>
                  ) : (
                    <span className="text-xs text-text-secondary-strong">Belum ada</span>
                  )}
                </dd>
              </div>
              {organizer.public_contact ? (
                <div className="border-t border-border pt-3">
                  <dt className="text-xs text-text-muted">Kontak publik</dt>
                  <dd className="mt-0.5 break-words text-text-secondary-strong">{organizer.public_contact}</dd>
                </div>
              ) : null}
            </dl>
            {organizer.review_count === 0 ? (
              <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-text-muted">
                Ulasan hanya dapat ditulis setelah sponsorship tercatat selesai.
              </p>
            ) : null}
            {canReport ? (
              <div className="mt-4 border-t border-border pt-3">
                <ReportDialog targetType="account" targetId={organizer.id} label="Laporkan penyelenggara" title="Laporkan penyelenggara" />
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-text">Event yang sedang membuka peluang</h2>
            <p className="text-xs text-text-muted">{events.length} event</p>
          </div>

          <div className="divide-y divide-border">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="group grid gap-4 py-6 sm:grid-cols-[160px_1fr] sm:gap-8">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium tabular-nums text-text">
                    <CalendarDays className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    {formatDateRange(event.date_start, event.date_end)}
                  </p>
                  <p className="mt-1.5 text-xs text-text-secondary-strong">{event.location}</p>
                  <p className="mt-3 text-xs text-text-muted">{event.category}</p>
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.015em] text-text group-hover:text-primary-strong">
                    {event.title}
                  </h3>
                  {event.audience_summary ? (
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-text-secondary-strong">{event.audience_summary}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <EvidenceTag>{event.evidence_count} bukti audiens</EvidenceTag>
                    <EvidenceTag>{event.package_count} paket</EvidenceTag>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
