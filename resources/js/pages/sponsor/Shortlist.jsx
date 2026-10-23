import { Head, Link, router } from '@inertiajs/react';
import { Bookmark, CalendarDays, MapPin } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { buttonClasses } from '../../components/Button';
import { EvidenceTag } from '../../components/StatusBadge';
import { formatDateRange } from '../../lib/utils';

export default function SponsorShortlist({ events }) {
  function remove(event, id) {
    event.preventDefault();
    event.stopPropagation();
    router.delete(`/sponsor/events/${id}/shortlist`, { preserveScroll: true });
  }

  return (
    <DashboardLayout
      eyebrow="Ruang kerja sponsor"
      title="Shortlist"
      actions={
        <Link href="/events" className={buttonClasses({ variant: 'outline' })}>
          Jelajahi peluang
        </Link>
      }
    >
      <Head title="Shortlist" />

      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <p className="text-sm text-text-secondary-strong">
          <span className="font-medium tabular-nums text-text">{events.total}</span> event tersimpan
        </p>
        <p className="text-xs text-text-muted">Terbaru disimpan di atas</p>
      </div>

      {events.data.length > 0 ? (
        <>
          <div className="divide-y divide-border">
            {events.data.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-5">
                <Link href={`/events/${item.slug}`} className="group min-w-0 flex-1">
                  <h2 className="truncate text-[16px] font-semibold text-text group-hover:text-primary-strong">{item.title}</h2>
                  <p className="mt-0.5 text-xs text-text-secondary-strong">{item.organizer}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-secondary-strong">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                      {formatDateRange(item.date_start, item.date_end)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                      {item.location}
                    </span>
                    <EvidenceTag tone="primary">{item.category}</EvidenceTag>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={(event) => remove(event, item.id)}
                  className={buttonClasses({ variant: 'destructive-outline', size: 'sm', className: 'shrink-0 text-xs' })}
                >
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                  Hapus
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Pagination paginator={events} />
          </div>
        </>
      ) : (
        <EmptyState
          className="mt-6"
          illustration="search"
          title="Shortlist masih kosong"
          description="Simpan event yang menarik saat menjelajahi peluang. Shortlist membantu Anda membandingkan sebelum menghubungi EO."
          action={<Link href="/events" className={buttonClasses()}>Jelajahi peluang</Link>}
        />
      )}
    </DashboardLayout>
  );
}
