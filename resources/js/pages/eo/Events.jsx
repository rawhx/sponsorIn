import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, ChevronRight, MapPin, Plus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Select } from '../../components/Form';
import { formatDateRange } from '../../lib/utils';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Sedang ditinjau' },
  { value: 'needs_changes', label: 'Perlu perbaikan' },
  { value: 'published', label: 'Terbit' },
  { value: 'closed', label: 'Ditutup' },
  { value: 'rejected', label: 'Ditolak' },
];

export default function EoEvents({ events, filters, counts }) {
  const { data, setData, get, processing } = useForm({ status: filters.status ?? '' });

  function submit(event) {
    event.preventDefault();
    get('/eo/events', { preserveState: true, preserveScroll: true, replace: true });
  }

  const countRows = [
    { key: 'draft', label: 'Draft', value: counts.draft },
    { key: 'under_review', label: 'Sedang ditinjau', value: counts.under_review },
    { key: 'needs_changes', label: 'Perlu perbaikan', value: counts.needs_changes },
    { key: 'published', label: 'Terbit', value: counts.published },
    { key: 'closed', label: 'Ditutup', value: counts.closed },
    { key: 'rejected', label: 'Ditolak', value: counts.rejected },
  ];

  return (
    <DashboardLayout
      eyebrow="Ruang kerja EO"
      title="Event saya"
      actions={
        <Link href="/eo/events/create" className={buttonClasses()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Event baru
        </Link>
      }
    >
      <Head title="Event saya" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
        <div className="min-w-0">
          <form onSubmit={submit} className="flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-4 sm:flex-row sm:items-end">
            <Field label="Saring status" htmlFor="status" className="flex-1">
              <Select id="status" value={data.status} onChange={(event) => setData('status', event.target.value)}>
                <option value="">Semua status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <button type="submit" className={buttonClasses()} disabled={processing}>
                {processing ? 'Menyaring…' : 'Terapkan'}
              </button>
              {data.status ? (
                <Link href="/eo/events" className={buttonClasses({ variant: 'outline' })}>Semua</Link>
              ) : null}
            </div>
          </form>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <p className="text-sm text-text-secondary-strong">
              <span className="font-medium tabular-nums text-text">{events.total}</span> event
            </p>
            <p className="text-xs text-text-muted">Terbaru di atas</p>
          </div>

          {events.data.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {events.data.map((event) => (
                  <Link
                    key={event.id}
                    href={`/eo/events/${event.id}`}
                    className="group flex items-center gap-4 py-4 hover:bg-hover"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">{event.title}</p>
                        <StatusBadge status={event.status} />
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-secondary-strong">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                          {formatDateRange(event.date_start, event.date_end)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                          {event.location}
                        </span>
                      </div>
                      {event.status === 'needs_changes' && event.moderation_reason_public ? (
                        <p className="mt-1.5 text-xs leading-relaxed text-warning-strong">{event.moderation_reason_public}</p>
                      ) : null}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className="mt-5">
                <Pagination paginator={events} />
              </div>
            </>
          ) : (
            <EmptyState
              className="mt-6"
              illustration="calendar"
            title="Belum ada event"
              description="Mulai dengan membuat event, tambahkan bukti audiens dan paket sponsorship, lalu kirim untuk moderasi."
              action={<Link href="/eo/events/create" className={buttonClasses()}><Plus className="h-4 w-4" aria-hidden="true" />Event baru</Link>}
            />
          )}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-background-muted p-4">
            <h2 className="text-sm font-semibold text-text">Ringkasan status</h2>
            <div className="mt-3 divide-y divide-border">
              {countRows.map((row) => (
                <Link
                  key={row.key}
                  href={`/eo/events?status=${row.key}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-text"
                >
                  <span className="text-text-secondary-strong">{row.label}</span>
                  <span className="tabular-nums text-text">{row.value}</span>
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Event hanya tampil publik setelah moderator menyetujui. Anda dapat mengubah draft dan event yang perlu perbaikan.
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}
