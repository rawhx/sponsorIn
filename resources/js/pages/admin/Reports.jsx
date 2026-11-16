import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Flag, Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
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

export default function AdminReports({ reports, filters, counts }) {
  const { data, setData, get, processing } = useForm({
    q: filters.q ?? '',
    status: filters.status ?? '',
  });

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'open', label: 'Terbuka' },
    { value: 'in_review', label: 'Sedang Ditinjau' },
    { value: 'resolved', label: 'Terklarifikasi' },
    { value: 'dismissed', label: 'Dibatalkan' },
  ];

  const countRows = [
    { key: 'open', label: 'Terbuka', tone: 'danger', count: counts?.open ?? 0 },
    { key: 'in_review', label: 'Sedang Ditinjau', tone: 'warning', count: counts?.in_review ?? 0 },
    { key: 'resolved', label: 'Terklarifikasi', tone: 'success', count: counts?.resolved ?? 0 },
    { key: 'dismissed', label: 'Dibatalkan', tone: 'neutral', count: counts?.dismissed ?? 0 },
  ];

  function handleSubmit(event) {
    event.preventDefault();
    get('/admin/reports', { preserveState: true, preserveScroll: true, replace: true });
  }

  function handleReset() {
    router.get('/admin/reports', {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  return (
    <DashboardLayout
      eyebrow="Operasional platform"
      title="Laporan Penyalahgunaan"
      description="Tangani pengaduan dari sponsor, EO, atau pengguna terkait konten dan kerja sama."
      actions={
        <Link href="/admin/dashboard" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
      }
    >
      <Head title="Laporan Penyalahgunaan" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        {/* Main Column */}
        <div className="min-w-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row sm:items-end gap-3 rounded-2xl border border-border/80 bg-surface p-4 shadow-xs"
          >
            <Field label="Cari Laporan" htmlFor="q" className="flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                <Input
                  id="q"
                  name="q"
                  value={data.q}
                  onChange={(event) => setData('q', event.target.value)}
                  placeholder="Nama pelapor, alasan, atau kata kunci…"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Status" htmlFor="status" className="sm:w-48">
              <Select
                id="status"
                value={data.status}
                onChange={(event) => setData('status', event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>

            <div className="flex gap-2">
              <Button type="submit" loading={processing}>
                Saring
              </Button>
              {(data.q || data.status) && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 flex items-baseline justify-between gap-4 border-b border-border/80 pb-3">
            <p className="text-sm text-text-secondary">
              Total <span className="font-semibold text-text tabular-nums">{reports.total}</span> laporan
            </p>
            <p className="text-xs text-text-muted">Terbaru di atas</p>
          </div>

          {reports.data.length > 0 ? (
            <div className="mt-4 space-y-3">
              {reports.data.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs space-y-3 transition-all hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-text">
                          {report.target_label ?? 'Laporan'}
                        </span>
                        <StatusBadge status={report.status} tone={severityTone(report.status)} />
                      </div>
                      <p className="mt-1 text-sm font-medium text-text">{report.reason}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        Dikirim: <span className="tabular-nums">{formatDateTime(report.created_at)}</span> · Pelapor:{' '}
                        <strong className="text-text font-medium">{report.reporter}</strong>
                      </p>
                    </div>

                    <Link
                      href={`/admin/reports/${report.id}`}
                      className={buttonClasses({ size: 'sm', variant: 'outline' })}
                    >
                      Buka Detail
                    </Link>
                  </div>

                  {report.details && (
                    <div className="rounded-xl bg-background/60 p-3 text-xs text-text-secondary leading-relaxed border border-border/50">
                      {report.details}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4">
                <Pagination paginator={reports} />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border/80 p-8 text-center">
              <Flag className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-3 text-sm font-semibold text-text">Belum ada laporan pengaduan</p>
              <p className="mt-1 text-xs text-text-secondary">Laporan pelanggaran yang dikirim pengguna akan masuk pada antrean ini.</p>
            </div>
          )}
        </div>

        {/* Aside Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Ringkasan Status</h2>
            <div className="mt-3 divide-y divide-border/60">
              {countRows.map((row) => (
                <Link
                  key={row.key}
                  href={`/admin/reports?status=${row.key}`}
                  className={`flex items-center justify-between py-2.5 text-xs transition-colors hover:text-primary ${data.status === row.key ? 'font-semibold text-primary' : 'text-text-secondary'}`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${row.tone === 'danger' ? 'bg-danger' : row.tone === 'warning' ? 'bg-warning' : row.tone === 'success' ? 'bg-success' : 'bg-text-muted'}`}
                    />
                    {row.label}
                  </span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold tabular-nums text-text">
                    {row.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/60 p-5 text-xs text-text-secondary space-y-2">
            <h3 className="font-semibold text-text">Tindak Lanjut Admin</h3>
            <p className="leading-relaxed">
              Setiap penyelesaian (resolusi) atau pembatalan laporan akan langsung tersimpan dan dicatat dalam audit log sistem.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
