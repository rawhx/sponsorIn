import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Database } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { buttonClasses } from '../../../components/Button';
import { formatDate } from '../../../lib/utils';

function formatValue(key, value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export default function AdminAuditLogShow({ log }) {
  return (
    <DashboardLayout
      eyebrow="Jejak audit internal"
      title={`Detail Audit #${log?.id ?? '—'}`}
      actions={
        <Link href="/admin/audit-log" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft className="h-4 w-4" />
          Daftar Log
        </Link>
      }
    >
      <Head title={`Detail Audit #${log?.id ?? '—'}`} />

      <div className="space-y-6">
        {/* Header Overview Card */}
        <section className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Aksi Sistem</p>
              <h1 className="mt-1 font-mono text-xl font-bold text-text">{log?.action ?? '—'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                {log?.entity_type ?? '—'} #{log?.entity_id ?? '—'}
              </span>
            </div>
          </div>

          <dl className="grid gap-4 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-text-muted">Pelaku / Aktor</dt>
              <dd className="mt-0.5 font-medium text-sm text-text">{log?.actor ?? 'Sistem'}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Waktu Pencatatan</dt>
              <dd className="mt-0.5 tabular-nums text-text-secondary">{formatDate(log?.created_at)}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Tipe Entitas</dt>
              <dd className="mt-0.5 font-medium text-text">{log?.entity_type ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-text-muted">ID Entitas</dt>
              <dd className="mt-0.5 font-mono text-text">{log?.entity_id ?? '—'}</dd>
            </div>
            {log?.reason && (
              <div className="sm:col-span-2">
                <dt className="text-text-muted">Alasan / Catatan</dt>
                <dd className="mt-1 rounded-xl bg-background/60 p-3 text-text-secondary leading-relaxed border border-border/50">
                  {log.reason}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Diff State Comparison (Before & After) */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Before */}
          <div className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Database className="h-4 w-4 text-text-muted" />
              Keadaan Sebelum (Before)
            </h2>
            {log?.before && Object.keys(log.before).length > 0 ? (
              <div className="space-y-2.5">
                {Object.entries(log.before).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs">
                    <p className="font-semibold text-text-muted">{key}</p>
                    <p className="mt-1 font-mono text-text-secondary whitespace-pre-wrap break-all">
                      {formatValue(key, value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border/70 p-4 text-center text-xs text-text-muted">
                Tidak ada data sebelum (rekaman baru dibuat)
              </p>
            )}
          </div>

          {/* After */}
          <div className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Database className="h-4 w-4 text-primary" />
              Keadaan Sesudah (After)
            </h2>
            {log?.after && Object.keys(log.after).length > 0 ? (
              <div className="space-y-2.5">
                {Object.entries(log.after).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                    <p className="font-semibold text-primary">{key}</p>
                    <p className="mt-1 font-mono text-text whitespace-pre-wrap break-all">
                      {formatValue(key, value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border/70 p-4 text-center text-xs text-text-muted">
                Tidak ada data sesudah (rekaman dihapus)
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
