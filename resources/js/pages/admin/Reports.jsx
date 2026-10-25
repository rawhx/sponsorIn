import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Flag, Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Input, Select } from '../../components/Form';
import { formatDate } from '../../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function severityTone(status) {
  if (status === 'open') return 'danger';
  if (status === 'in_review') return 'warning';
  if (status === 'resolved') return 'success';
  if (status === 'dismissed') return 'neutral';
  return 'neutral';
}

function targetLabel(report) {
  const map = {
    event: 'Event',
    account: 'Akun',
    review: 'Ulasan',
    sponsorship: 'Kerja sama',
    proposal: 'Proposal',
  };
  return map[report.target_type ?? ''] ?? 'Laporan';
}

export default function AdminReports({ reports, filters, counts }) {
  const { flash } = usePage().props;

  const statusOptions = [
    { value: '', label: 'Semua status' },
    { value: 'open', label: 'Terbuka' },
    { value: 'in_review', label: 'Sedang ditinjau' },
    { value: 'resolved', label: 'Terklarifikasi' },
    { value: 'dismissed', label: 'Dibatalkan' },
  ];

  const countRows = [
    { value: 'open', label: 'Terbuka', tone: 'danger' },
    { value: 'in_review', label: 'Sedang ditinjau', tone: 'warning' },
    { value: 'resolved', label: 'Terklarifikasi', tone: 'success' },
    { value: 'dismissed', label: 'Dibatalkan', tone: 'neutral' },
  ].map((row) => ({ ...row, value: counts?.[row.value] ?? 0 }));

  function handleSubmit(event) {
    event.preventDefault();
    setFilters?.({ q: filters.q, status: filters.status });
  }

  return (
    <DashboardLayout
      eyebrow="Laporan penyalahgunaan"
      title="Laporan"
      actions={
        <Link href="/admin/dashboard" className={buttonClasses({ variant: 'outline' })}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Ringkasan
        </Link>
      }
    >
      <Head title="Laporan" />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        <div className="min-w-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[12px] border border-border bg-surface p-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Cari laporan" htmlFor="q">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                  <Input
                    id="q"
                    name="q"
                    value={filters.q ?? ''}
                    onChange={(event) => setFilters?.({ ...filters, q: event.target.value })}
                    placeholder="Nama, event, ulasan, atau alasan…"
                  />
                </div>
              </Field>
            </div>
            <div className="flex gap-2">
              <Field label="Status" htmlFor="status" className="flex-1">
                <Select
                  id="status"
                  value={filters.status ?? ''}
                  onChange={(event) => setFilters?.({ ...filters, status: event.target.value })}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </Field>
              <button type="submit" className={buttonClasses()}>
                Terapkan
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
            <p className="text-2xl font-semibold tabular-nums text-text">{reports.total}</p>
            <p className="text-xs text-text-secondary-strong">laporan yang ditemukan</p>
          </div>

          {reports.data.length > 0 ? (
            <div className="mt-5 divide-y divide-border">
              {reports.data.map((report) => (
                <div key={report.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">{targetLabel(report)}</p>
                      <StatusBadge status={report.status} tone={severityTone(report.status)} />
                    </div>
                    <p className="mt-1 text-sm text-text-secondary-strong">{report.reason}</p>
                    <p className="mt-2 text-xs text-text-muted">
                      Dikirim {formatDateTime(report.created_at)} · Dilaporkan oleh{' '}
                      <span className="text-text">{report.reporter}</span> · Ditugaskan:{' '}
                      <span className="text-text">{report.assigned_admin ?? '—'}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3 sm:ml-6">
                    {report.details ? (
                      <p className="text-xs text-text-secondary-strong">{report.details}</p>
                    ) : null}
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className={buttonClasses({ variant: 'outline', size: 'sm' })}
                    >
                      Lihat detail
                    </Link>
                    <Link
                      href={`/admin/reports/${report.id}/resolve`}
                      className={buttonClasses({ size: 'sm' })}
                    >
                      Tindak lanjut
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[12px] border border-dashed border-border px-6 py-10 text-center">
              <Flag className="mx-auto h-10 w-10 text-text-muted" aria-hidden="true" />
              <p className="mt-4 text-sm font-medium text-text">Belum ada laporan</p>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-text-secondary-strong">
                Laporan dari sponsor, EO, atau pengguna lain akan muncul di sini untuk ditinjau.
              </p>
            </div>
          )}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Ringkuman status</h2>
            <div className="mt-3 divide-y divide-border">
              {countRows.map((row) => (
                <Link
                  key={row.value}
                  href={`/admin/reports?status=${row.value}`}
                  className={`flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:text-text ${row.tone === 'danger' ? 'text-danger-strong' : row.tone === 'warning' ? 'text-warning-strong' : row.tone === 'success' ? 'text-success-strong' : 'text-text-secondary-strong'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${row.tone === 'danger' ? 'bg-danger' : row.tone === 'warning' ? 'bg-warning' : row.tone === 'success' ? 'bg-success' : 'bg-text-muted'}`} aria-hidden="true" />
                    {row.label}
                  </span>
                  <span className="tabular-nums text-text">{row.value}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[12px] border border-border bg-background-muted p-5">
            <h2 className="text-sm font-semibold text-text">Panduan</h2>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-text-secondary-strong">
              <li>Laporan dapat menarget event, akun, ulasan, kerja sama, atau proposal.</li>
              <li>Setiap laporan dilacak dari pengiriman sampai penanganan admin.</li>
              <li>Tindakan admin dicatat pada audit log internal.</li>
            </ul>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
