import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { buttonClasses } from '../../../components/Button';
import { formatDate } from '../../../lib/utils';

function formatValue(key, value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
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
      title={`Detail #${log?.id ?? '—'}`}
      actions={
        <Link href="/admin/audit-log" className={buttonClasses({ variant: 'outline' })}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke daftar
        </Link>
      }
    >
      <Head title={`Detail audit #${log?.id ?? '—'}`} />

      <div className="flex flex-col gap-6">
        <div className="rounded-[12px] border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.06em] text-text-muted">LOG AUDIT</p>
              <h1 className="mt-1.5 text-2xl font-semibold text-text">
                {log?.action ?? '—'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary-strong">{log?.entity_type ?? '—'}</span>
              <span className="text-xs tabular-nums text-text-muted">#{log?.entity_id ?? '—'}</span>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs text-text-muted">Pelaku</dt>
              <dd className="mt-1 text-sm text-text">{log?.actor ?? 'sistem'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Waktu</dt>
              <dd className="mt-0.5 text-sm text-text-secondary-strong">{formatDate(log?.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Entitas</dt>
              <dd className="mt-0.5 text-sm text-text-secondary-strong">{log?.entity_type ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Entitas ID</dt>
              <dd className="mt-0.5 text-sm text-text-secondary-strong">{log?.entity_id ?? '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-text-muted">Alasan</dt>
              <dd className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{log?.reason ?? '—'}</dd>
            </div>
          </dl>
        </div>

        {Object.keys(log?.before ?? {}).length > 0 ? (
          <div className="rounded-[12px] border border-border bg-background-muted p-6">
            <h2 className="text-sm font-semibold text-text">Sebelum</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {Object.entries(log.before).map(([key, value]) => (
                <div key={key} className="rounded-[8px] border border-border bg-surface px-3.5 py-2.5">
                  <p className="text-xs text-text-muted">{key}</p>
                  <p className="mt-0.5 text-sm font-mono text-text-secondary-strong">{formatValue(key, value)}</p>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {Object.keys(log?.after ?? {}).length > 0 ? (
          <div className="rounded-[12px] border border-border bg-surface p-6">
            <h2 className="text-sm font-semibold text-text">Sesudah</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {Object.entries(log.after).map(([key, value]) => (
                <div key={key} className="rounded-[8px] border border-border bg-surface px-3.5 py-2.5">
                  <p className="text-xs text-text-muted">{key}</p>
                  <p className="mt-0.5 text-sm font-mono text-text-secondary-strong">{formatValue(key, value)}</p>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
