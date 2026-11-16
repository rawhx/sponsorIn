import { Head, Link, useForm } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
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
    { key: 'published', label: 'Terbit publik', value: counts.published },
    { key: 'needs_changes', label: 'Perlu perbaikan', value: counts.needs_changes },
    { key: 'unpublished', label: 'Ditarik', value: counts.unpublished },
    { key: 'rejected', label: 'Ditolak', value: counts.rejected },
  ];

  return (
    <DashboardLayout
      eyebrow="Operasional platform"
      title="Moderasi Event"
      description="Tinjau, setujui, minta perbaikan, atau turunkan event yang diajukan oleh event organizer."
    >
      <Head title="Moderasi Event" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        {/* Main Column */}
        <div className="min-w-0">
          <form
            onSubmit={submit}
            className="flex flex-col sm:flex-row sm:items-end gap-3 rounded-2xl border border-border/80 bg-surface p-4 shadow-xs"
          >
            <Field label="Status Moderasi" htmlFor="status" className="flex-1">
              <Select id="status" value={data.status} onChange={(event) => setData('status', event.target.value)}>
                <option value="">Semua Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button type="submit" loading={processing}>
                Saring
              </Button>
              {data.status && (
                <Link href="/admin/events" className={buttonClasses({ variant: 'outline' })}>
                  Semua
                </Link>
              )}
            </div>
          </form>

          <div className="mt-6 flex items-baseline justify-between gap-4 border-b border-border/80 pb-3">
            <p className="text-sm text-text-secondary">
              Total <span className="font-semibold text-text tabular-nums">{events.total}</span> event
            </p>
            <p className="text-xs text-text-muted">Terbaru diperbarui di atas</p>
          </div>

          {events.data.length > 0 ? (
            <div className="mt-4 space-y-2.5">
              {events.data.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-surface p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-text group-hover:text-primary transition-colors">
                        {event.title}
                      </p>
                      <StatusBadge status={event.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-text-secondary">
                      EO: <strong className="font-medium text-text">{event.organizer}</strong> · {event.category} · {event.location}
                    </p>
                    <p className="mt-1 text-[11px] tabular-nums text-text-muted">
                      Diperbarui: {formatDateTime(event.updated_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-semibold text-primary group-hover:underline">
                      Tinjau &rarr;
                    </span>
                  </div>
                </Link>
              ))}
              <div className="pt-4">
                <Pagination paginator={events} />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border/80 p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-3 text-sm font-semibold text-text">Tidak ada event pada status ini</p>
              <p className="mt-1 text-xs text-text-secondary">Pilih filter status lain atau reset pencarian.</p>
            </div>
          )}
        </div>

        {/* Aside Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Ringkasan Moderasi</h2>
            <div className="mt-3 divide-y divide-border/60">
              {countRows.map((row) => (
                <Link
                  key={row.key}
                  href={`/admin/events?status=${row.key}`}
                  className={`flex items-center justify-between py-2.5 text-xs transition-colors hover:text-primary ${data.status === row.key ? 'font-semibold text-primary' : 'text-text-secondary'}`}
                >
                  <span>{row.label}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold tabular-nums text-text">
                    {row.value}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/60 p-5 text-xs text-text-secondary space-y-2">
            <h3 className="font-semibold text-text">Standar Kelayakan Event</h3>
            <p className="leading-relaxed">
              Pastikan event memiliki tanggal, lokasi, estimasi audiens yang masuk akal, serta bukti pendukung yang valid sebelum disetujui terbit.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
