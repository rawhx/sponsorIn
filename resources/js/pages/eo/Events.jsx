import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, ChevronRight, MapPin, Plus, Filter } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Select } from '../../components/Form';
import { formatDateRange } from '../../lib/utils';

const statusOptions = [
  { value: 'draft', label: 'Draf' },
  { value: 'under_review', label: 'Sedang Ditinjau' },
  { value: 'needs_changes', label: 'Perlu Perbaikan' },
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
    { key: 'draft', label: 'Draf', value: counts.draft },
    { key: 'under_review', label: 'Sedang Ditinjau', value: counts.under_review },
    { key: 'needs_changes', label: 'Perlu Perbaikan', value: counts.needs_changes },
    { key: 'published', label: 'Terbit', value: counts.published },
    { key: 'closed', label: 'Ditutup', value: counts.closed },
    { key: 'rejected', label: 'Ditolak', value: counts.rejected },
  ];

  return (
    <DashboardLayout
      eyebrow="Ruang Kerja EO"
      title="Manajemen Event"
      description="Daftar seluruh event yang Anda rancang, status moderasi, dan riwayat publikasi."
      actions={
        <Link href="/eo/events/create" className={buttonClasses()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Buat Event Baru
        </Link>
      }
    >
      <Head title="Manajemen Event" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        <div className="min-w-0 space-y-5">
          {/* Filter form */}
          <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-end">
            <Field label="Filter Status Event" htmlFor="status" className="flex-1">
              <Select id="status" value={data.status} onChange={(event) => setData('status', event.target.value)}>
                <option value="">Semua Status Event</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <button type="submit" className={buttonClasses({ size: 'md' })} disabled={processing}>
                <Filter className="h-4 w-4" />
                {processing ? 'Menyaring…' : 'Terapkan'}
              </button>
              {data.status ? (
                <Link href="/eo/events" className={buttonClasses({ variant: 'outline', size: 'md' })}>Semua</Link>
              ) : null}
            </div>
          </form>

          {/* Count bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <p className="text-sm font-medium text-slate-600">
              Menampilkan <span className="font-bold text-slate-900 tabular-nums">{events.total}</span> event
            </p>
            <p className="text-xs text-slate-400">Paling baru di atas</p>
          </div>

          {events.data.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
              {events.data.map((event) => (
                <Link
                  key={event.id}
                  href={`/eo/events/${event.id}`}
                  className="group flex items-center justify-between gap-4 p-4 sm:p-5 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <p className="truncate text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {event.title}
                      </p>
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <CalendarDays className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        {formatDateRange(event.date_start, event.date_end)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        {event.location}
                      </span>
                    </div>
                    {event.status === 'needs_changes' && event.moderation_reason_public ? (
                      <div className="mt-2.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-200">
                        <span className="font-bold">Catatan Moderator:</span> {event.moderation_reason_public}
                      </div>
                    ) : null}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              illustration="calendar"
              title="Belum ada event terdaftar"
              description="Mulai rancang event Anda, tambahkan berkas bukti audiens dan paket sponsorship, lalu ajukan untuk moderasi publikasi."
              action={
                <Link href="/eo/events/create" className={buttonClasses()}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Buat Event Sekarang
                </Link>
              }
            />
          )}

          {events.data.length > 0 && (
            <Pagination paginator={events} />
          )}
        </div>

        {/* Aside status counts */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Ringkasan Status Event</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {countRows.map((row) => (
                <Link
                  key={row.key}
                  href={`/eo/events?status=${row.key}`}
                  className="flex items-center justify-between py-2.5 text-sm font-medium transition-colors hover:text-emerald-700"
                >
                  <span className="text-slate-600">{row.label}</span>
                  <span className="tabular-nums font-bold text-slate-900">{row.value}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-xs leading-relaxed text-slate-500">
              Event Anda akan tampil di direktori publik setelah tim moderasi meninjau kelengkapan berkas dan bukti audiens.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
