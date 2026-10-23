import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ChevronRight, ClipboardList, Flag } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
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

export default function AdminDashboard({ counts, pendingVerifications, recentAudit }) {
  return (
    <DashboardLayout
      eyebrow="Operasional platform"
      title="Ringkasan admin"
      actions={
        <Link href="/admin/verifications" className={buttonClasses({ variant: 'outline' })}>
          Buka antrean verifikasi
        </Link>
      }
    >
      <Head title="Ringkasan admin" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="rounded-[12px] border border-border bg-surface">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-xs font-medium tracking-[0.06em] text-text-muted">ANTREAN VERIFIKASI</p>
              <h2 className="mt-1.5 text-lg font-semibold text-text">Pengajuan sponsor</h2>
            </div>
            <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning-strong tabular-nums">
              {counts.pending_verifications} menunggu
            </span>
          </div>
          {pendingVerifications.length > 0 ? (
            <div className="divide-y divide-border">
              {pendingVerifications.map((verification) => (
                <Link
                  key={verification.id}
                  href={`/admin/verifications/${verification.id}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-hover"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">{verification.organization_name}</p>
                    <p className="mt-0.5 text-xs text-text-secondary-strong">Diajukan {formatDateTime(verification.submitted_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={verification.status} />
                    <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-success-strong" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-text">Antrean verifikasi kosong</p>
                  <p className="mt-1 text-sm text-text-secondary-strong">Tidak ada pengajuan yang menunggu peninjauan saat ini.</p>
                </div>
              </div>
            </div>
          )}
          <div className="border-t border-border px-5 py-3">
            <Link href="/admin/verifications" className="text-sm font-medium text-primary-strong hover:text-text">
              Lihat seluruh verifikasi
            </Link>
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-[12px] border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Flag className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text">Laporan terbuka</h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-2xl font-semibold tabular-nums text-text">{counts.open_reports}</p>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                Modul penanganan laporan belum aktif pada tahap ini. Angka diambil dari antrean laporan yang tersimpan.
              </p>
            </div>
          </section>

          <section className="rounded-[12px] border border-border bg-background-muted p-5">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary-strong" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text">Panduan keputusan</h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-text-secondary-strong">
              <li>Periksa kecocokan nama badan usaha, bentuk hukum, NIB, dan NPWP.</li>
              <li>Buka dokumen pendukung melalui tautan terproteksi, bukan URL publik.</li>
              <li>Tulis alasan yang dapat dibaca sponsor ketika meminta informasi atau menolak.</li>
              <li>Catat alasan internal secara terpisah dari alasan publik.</li>
            </ul>
          </section>
        </div>
      </div>

      <section className="mt-8">
        <div className="border-b border-border pb-3">
          <h2 className="text-sm font-semibold text-text">Jejak audit terbaru</h2>
        </div>
        {recentAudit.length > 0 ? (
          <div className="divide-y divide-border">
            {recentAudit.map((log) => (
              <div key={log.id} className="grid gap-1 py-3.5 sm:grid-cols-[1fr_180px] sm:items-baseline sm:gap-6">
                <div>
                  <p className="text-sm font-medium text-text">{log.action}</p>
                  <p className="mt-0.5 text-xs text-text-secondary-strong">Oleh {log.actor ?? 'sistem'}</p>
                </div>
                <p className="text-xs tabular-nums text-text-muted sm:text-right">{formatDateTime(log.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-5 text-sm text-text-secondary-strong">Belum ada aktivitas tercatat.</p>
        )}
      </section>
    </DashboardLayout>
  );
}
