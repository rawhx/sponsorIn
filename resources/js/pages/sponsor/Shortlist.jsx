import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, ExternalLink, MapPin, Trash2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import Button, { buttonClasses } from '../../components/Button';
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
      title="Shortlist Event Tersimpan"
      description="Daftar event yang Anda simpan untuk dievaluasi dan dibandingkan sebelum mengirim penawaran."
      actions={
        <Link href="/sponsor/events" className={buttonClasses({ size: 'sm' })}>
          Jelajahi Peluang
        </Link>
      }
    >
      <Head title="Shortlist" />

      <div className="flex items-baseline justify-between gap-4 border-b border-border/80 pb-4">
        <p className="text-sm text-text-secondary">
          Total tersimpan: <span className="font-semibold text-text tabular-nums">{events.total}</span> event
        </p>
        <p className="text-xs text-text-muted">Terbaru disimpan berada di urutan teratas</p>
      </div>

      {events.data.length > 0 ? (
        <div className="mt-5 space-y-3">
          {events.data.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <Link href={`/sponsor/events/${item.slug}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                    {item.title}
                  </h2>
                  <EvidenceTag tone="primary">{item.category}</EvidenceTag>
                </div>
                <p className="mt-1 text-xs font-medium text-text-secondary">Penyelenggara: {item.organizer}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>{formatDateRange(item.date_start, item.date_end)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                    <span>{item.location}</span>
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t border-border/50 sm:border-t-0">
                <Link
                  href={`/sponsor/events/${item.slug}`}
                  className={buttonClasses({ variant: 'outline', size: 'sm' })}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Lihat Detail
                </Link>
                <Button
                  type="button"
                  variant="destructive-outline"
                  size="sm"
                  onClick={(event) => remove(event, item.id)}
                  title="Hapus dari shortlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
          <div className="pt-4">
            <Pagination paginator={events} />
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            illustration="search"
            title="Shortlist Anda masih kosong"
            description="Simpan event-event menarik saat menjelajahi katalog peluang untuk membandingkannya sebelum mengirim proposal."
            action={
              <Link href="/sponsor/events" className={buttonClasses()}>
                Jelajahi Peluang Event
              </Link>
            }
          />
        </div>
      )}
    </DashboardLayout>
  );
}
