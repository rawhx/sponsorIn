import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatusBadge from '../../../components/StatusBadge';
import Button, { buttonClasses } from '../../../components/Button';
import { Field, Select, Textarea } from '../../../components/Form';
import { formatDate } from '../../../lib/utils';

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

export default function AdminReportsShow({ report }) {
  const { data, setData, post, processing, errors } = useForm({
    status: report?.status ?? 'in_review',
    resolution: report?.resolution ?? '',
    note: '',
  });

  function submitResolution(e) {
    e.preventDefault();
    post(`/admin/reports/${report.id}/resolve`, { preserveScroll: true });
  }

  return (
    <DashboardLayout
      eyebrow="Operasional platform"
      title={`Detail Laporan #${report?.id ?? '—'}`}
      actions={
        <div className="flex items-center gap-3">
          <StatusBadge status={report?.status} tone={severityTone(report?.status)} />
          <Link href="/admin/reports" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      }
    >
      <Head title={`Laporan #${report?.id ?? '—'}`} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main Column */}
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Target Laporan</p>
                <h1 className="mt-1 text-xl font-bold text-text">{report?.target_label ?? 'Laporan'}</h1>
              </div>
              <StatusBadge status={report?.status} tone={severityTone(report?.status)} />
            </div>

            <dl className="grid gap-4 text-xs sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-text-muted">Alasan Pengaduan</dt>
                <dd className="mt-1 font-medium text-sm text-text leading-relaxed">{report?.reason ?? '—'}</dd>
              </div>

              {report?.details && (
                <div className="sm:col-span-2">
                  <dt className="text-text-muted">Rincian Tambahan</dt>
                  <dd className="mt-1 rounded-xl bg-background/60 p-4 border border-border/50 text-text-secondary leading-relaxed">
                    {report.details}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-text-muted">Dilaporkan Oleh</dt>
                <dd className="mt-0.5 font-medium text-text">{report?.reporter ?? '—'}</dd>
              </div>

              <div>
                <dt className="text-text-muted">Admin Penanggung Jawab</dt>
                <dd className="mt-0.5 font-medium text-text">{report?.assigned_admin ?? '—'}</dd>
              </div>

              <div>
                <dt className="text-text-muted">Tanggal Masuk</dt>
                <dd className="mt-0.5 tabular-nums text-text-secondary">{formatDateTime(report?.created_at)}</dd>
              </div>

              <div>
                <dt className="text-text-muted">Tanggal Selesai</dt>
                <dd className="mt-0.5 tabular-nums text-text-secondary">{formatDateTime(report?.resolved_at)}</dd>
              </div>
            </dl>
          </section>

          {report?.resolution && (
            <section className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6 space-y-2">
              <h2 className="text-sm font-semibold text-text">Penanganan Terakhir</h2>
              <p className="rounded-xl bg-background/60 p-4 border border-border/50 text-xs leading-relaxed text-text-secondary">
                {report.resolution}
              </p>
            </section>
          )}
        </div>

        {/* Aside Sidebar: Action Form */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={submitResolution} className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6 space-y-4">
            <div className="border-b border-border/70 pb-3">
              <h2 className="text-base font-semibold text-text">Tindak Lanjut Laporan</h2>
              <p className="mt-0.5 text-xs text-text-secondary">Perbarui status dan catatan penanganan masalah</p>
            </div>

            <Field label="Status Penanganan" htmlFor="status" error={errors.status} required>
              <Select id="status" value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status}>
                <option value="in_review">Sedang Ditinjau</option>
                <option value="resolved">Terklarifikasi / Selesai</option>
                <option value="dismissed">Batalkan / Tidak Valid</option>
              </Select>
            </Field>

            <Field label="Catatan Resolusi" htmlFor="resolution" error={errors.resolution}>
              <Textarea
                id="resolution"
                value={data.resolution}
                onChange={(e) => setData('resolution', e.target.value)}
                error={errors.resolution}
                rows={3}
                placeholder="Tindakan yang telah diambil terhadap target laporan…"
              />
            </Field>

            <Field label="Catatan Internal Audit" htmlFor="note" error={errors.note}>
              <Textarea
                id="note"
                value={data.note}
                onChange={(e) => setData('note', e.target.value)}
                error={errors.note}
                rows={2}
                placeholder="Alasan perubahan untuk jejak audit internal…"
              />
            </Field>

            <Button type="submit" className="w-full" loading={processing}>
              Simpan Tindak Lanjut
            </Button>
          </form>
        </aside>
      </div>
    </DashboardLayout>
  );
}
