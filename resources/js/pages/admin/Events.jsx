import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Select } from '../../components/Form';
import { formatDate } from '../../lib/utils';

const statusOptions = [
  { value: 'under_review', label: 'Sedang ditinjau' },
  { value: 'published', label: 'Terbit' },
  { value: 'needs_changes', label: 'Perlu perbaikan' },
  { value: 'unpublished', label: 'Ditarik' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Ditutup' },
];

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminEvents({ events, filters, counts }) {
  const { data, setData, get, processing } = useForm({ status: filters.status ?? '' });

  function submit(event) {
    event.preventDefault();
    get('/admin/events', { preserveState: true, preserveScroll: true, replace: true });
  }

  const countRows = [
    { key: 'under_review', label: 'Menunggu moderasi', value: counts.under_review },
    { key: 'published', label: 'Terbit', value: counts.published },
    { key: 'needs_changes', label: 'Perlu perbaikan', value: counts.needs_changes },
    { key: 'unpublished', label: 'Ditarik', value: counts.unpublished },
    { key: 'rejected', label: 'Ditolak', value: counts.rejected },
  ];

  return (
    <DashboardLayout eyebrow="Operasional platform" title="Moderasi event">
      <Head title="Moderasi event" />

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
              {data.status ? <Link href="/admin/events" className={buttonClasses({ variant: 'outline' })}>Semua</Link> : null}
            </div>
          </form>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <p className="text-sm text-text-secondary-strong">
              <span className="font-medium tabular-nums text-text">{events.total}</span> event
            </p>
            <p className="text-xs text-text-muted">Terbaru diperbarui di atas</p>
          </div>

          {events.data.length > 0 ? (
            <>
              <div className="hidden gap-4 border-b border-border pb-2 text-xs text-text-muted sm:grid sm:grid-cols-[1fr_140px_120px_20px]">
                <p>Event</p>
                <p>Diperbarui</p>
                <p>Status</p>
                <span />
              </div>
              <div className="divide-y divide-border">
                {events.data.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="group grid gap-3 py-4 hover:bg-hover sm:grid-cols-[1fr_140px_120px_20px] sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">{event.title}</p>
                      <p className="mt-0.5 truncate text-xs text-text-secondary-strong">{event.organizer} · {event.category} · {event.location}</p>
                    </div>
                    <p className="text-xs tabular-nums text-text-secondary-strong">{formatDateTime(event.updated_at)}</p>
                    <StatusBadge status={event.status} />
                    <ChevronRight className="hidden h-4 w-4 text-text-muted sm:block" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className="mt-5">
                <Pagination paginator={events} />
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[12px] border border-dashed border-border px-6 py-10 text-center">
              <p className="text-sm font-medium text-text">Tidak ada event pada filter ini</p>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-text-secondary-strong">Ubah filter status atau kembali ke seluruh antrean moderasi.</p>
            </div>
          )}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-background-muted p-4">
            <h2 className="text-sm font-semibold text-text">Ringkasan status</h2>
            <div className="mt-3 divide-y divide-border">
              {countRows.map((row) => (
                <Link
                  key={row.key}
                  href={`/admin/events?status=${row.key}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-text"
                >
                  <span className="text-text-secondary-strong">{row.label}</span>
                  <span className="tabular-nums text-text">{row.value}</span>
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Setujui event yang layak tampil publik. Alasan publik wajib ditulis untuk keputusan perbaikan, penolakan, dan penarikan.
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}
