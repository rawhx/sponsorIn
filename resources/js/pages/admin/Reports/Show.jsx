import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, Flag, User } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatusBadge from '../../../components/StatusBadge';
import { buttonClasses } from '../../../components/Button';
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

function targetLabel(report) {
  const map = {
    event: 'Event',
    account: 'Akun',
    review: 'Ulasan',
    sponsorship: 'Kerja sama',
    proposal: 'Proposal',
  };
  return map[report?.target_type ?? ''] ?? 'Laporan';
}

export default function AdminReportsShow({ report }) {
  return (
    <DashboardLayout
      eyebrow="Laporan penyalahgunaan"
      title="Detail laporan"
      actions={
        <Link href="/admin/reports" className={buttonClasses({ variant: 'outline' })}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke daftar
        </Link>
      }
    >
      <Head title={`Detail laporan #${report?.id ?? '—'}`} />

      <div className="flex flex-col gap-6">
        <div className="rounded-[12px] border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.06em] text-text-muted">LAPORAN</p>
              <h1 className="mt-1.5 text-2xl font-semibold text-text">{targetLabel(report)}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <StatusBadge status={report?.status} tone={severityTone(report?.status)} />
            </div>
          </div>

          <dl className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs text-text-muted">Alasan</dt>
              <dd className="mt-1 text-sm leading-relaxed text-text">{report?.reason ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Detail</dt>
              <dd className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{report?.details ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Dilaporkan oleh</dt>
              <dd className="mt-0.5 text-sm text-text-secondary-strong">
                {report?.reporter ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Ditugaskan ke</dt>
              <dd className="mt-0.5 text-sm text-text-secondary-strong">
                {report?.assigned_admin ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Dikirim</dt>
              <dd className="mt-0.5 text-sm text-text-secondary-strong">{formatDateTime(report?.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Selesai</dt>
              <dd className="mt-0.5 text-sm text-text-secondary-strong">{formatDateTime(report?.resolved_at)}</dd>
            </div>
          </dl>
        </div>

        {report?.resolution ? (
          <div className="rounded-[12px] border border-border bg-surface p-6">
            <h2 className="text-sm font-semibold text-text">Penanganan</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary-strong">{report.resolution}</p>
          </div>
        ) : null}

        <div className="rounded-[12px] border border-border bg-background-muted p-6">
          <h2 className="text-sm font-semibold text-text">Panduan penanganan</h2>
          <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-text-secondary-strong">
            <li>Tindak lanjut dilakukan melalui menu <span className="text-text">Tindak Lanjut</span> di atas.</li>
            <li>Status laporan diperbarui: Terbuka, Sedang Ditinjau, Terklarifikasi, atau Dibatalkan.</li>
            <li>Setiap perubahan dicatat pada audit log internal.</li>
            <li>Detail penyelesaian disimpan sebagai bukti bahwa laporan telah ditangani.</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
