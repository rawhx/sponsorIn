import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ChevronRight, ClipboardList, Flag, History, ShieldAlert } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
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
      eyebrow="Operasional Platform"
      title="Ringkasan Operasional Admin"
      description="Pantau antrean verifikasi legal sponsor, moderasi konten, laporan penyalahgunaan, dan jejak audit."
    >
      <Head title="Ringkasan Admin" />

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Antrean Verifikasi</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-text">{counts.pending_verifications}</p>
            <p className="mt-1 text-xs text-text-secondary">Pengajuan sponsor menunggu review</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning-strong">
            <ShieldAlert className="h-6 w-6" />
          </span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Laporan Terbuka</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-text">{counts.open_reports}</p>
            <p className="mt-1 text-xs text-text-secondary">Laporan pelanggaran/dispute</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger-strong">
            <Flag className="h-6 w-6" />
          </span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Aktivitas Audit</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums text-text">{recentAudit?.length ?? 0}</p>
            <p className="mt-1 text-xs text-text-secondary">Catatan jejak sistem terakhir</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <History className="h-6 w-6" />
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Verification Queue Section */}
        <section className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 border-b border-border/70 p-5 sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-text">Antrean Verifikasi Sponsor</h2>
                <p className="mt-0.5 text-xs text-text-secondary">Pemeriksaan NIB, NPWP, dan berkas legalitas perusahaan</p>
              </div>
              <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-warning-strong">
                {counts.pending_verifications} Menunggu
              </span>
            </div>

            {pendingVerifications.length > 0 ? (
              <div className="divide-y divide-border/60">
                {pendingVerifications.map((verification) => (
                  <Link
                    key={verification.id}
                    href={`/admin/verifications/${verification.id}`}
                    className="group flex items-center justify-between gap-4 p-4 sm:p-5 transition-colors hover:bg-hover"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text group-hover:text-primary transition-colors">
                        {verification.organization_name}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        Diajukan pada {formatDateTime(verification.submitted_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={verification.status} />
                      <ChevronRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
                <p className="mt-3 text-sm font-semibold text-text">Antrean Verifikasi Bersih</p>
                <p className="mt-1 text-xs text-text-secondary">Tidak ada pengajuan verifikasi sponsor yang tertunda saat ini.</p>
              </div>
            )}
          </div>

          <div className="border-t border-border/70 p-4 sm:px-6 bg-background/30 flex items-center justify-between">
            <span className="text-xs text-text-muted">Kelola seluruh persetujuan sponsor</span>
            <Link href="/admin/verifications" className="text-xs font-semibold text-primary hover:text-primary-strong">
              Buka Semua Verifikasi &rarr;
            </Link>
          </div>
        </section>

        {/* Operational Guidelines & Quick Info */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Protokol Verifikasi Admin</h2>
            </div>
            <ul className="space-y-3 text-xs text-text-secondary leading-relaxed divide-y divide-border/40">
              <li className="pt-2">Cocokkan nama resmi entitas dengan dokumen NIB OSS atau Kepmenkumham terlampir.</li>
              <li className="pt-2">Unduh dan buka berkas legal melalui endpoint aman terenkripsi; jangan mendistribusikan ke luar.</li>
              <li className="pt-2">Tuliskan pesan penolakan atau permintaan informasi tambahan dengan bahasa yang konstruktif untuk sponsor.</li>
              <li className="pt-2">Gunakan kolom catatan internal untuk kebutuhan arsip antar-administrator operasional.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Moderasi Event Aktif</h3>
              <p className="mt-1 text-xs text-text-secondary">Tinjau kesesuaian event baru dari pihak EO</p>
            </div>
            <Link href="/admin/events" className={buttonClasses({ size: 'sm', variant: 'outline' })}>
              Moderasi Event
            </Link>
          </section>
        </div>
      </div>

      {/* Audit Log Stream */}
      <section className="mt-8 rounded-2xl border border-border/80 bg-surface shadow-xs p-6">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div>
            <h2 className="text-base font-semibold text-text">Jejak Audit Aktivitas Terakhir</h2>
            <p className="mt-0.5 text-xs text-text-secondary">Pencatatan real-time aksi penting yang terjadi pada platform</p>
          </div>
          <Link href="/admin/audit-log" className="text-xs font-semibold text-primary hover:text-primary-strong">
            Lihat Semua Log &rarr;
          </Link>
        </div>

        {recentAudit.length > 0 ? (
          <div className="divide-y divide-border/60">
            {recentAudit.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-text">{log.action}</p>
                  <p className="mt-0.5 text-[11px] text-text-secondary">
                    Oleh: <strong className="font-medium text-text">{log.actor ?? 'Sistem'}</strong>
                  </p>
                </div>
                <p className="text-[11px] tabular-nums text-text-muted">{formatDateTime(log.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-text-secondary">Belum ada riwayat aktivitas yang tercatat.</p>
        )}
      </section>
    </DashboardLayout>
  );
}
