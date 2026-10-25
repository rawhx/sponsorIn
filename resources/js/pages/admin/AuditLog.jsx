import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { buttonClasses } from '../../components/Button';
import { Field, Input, Select } from '../../components/Form';
import { formatDate } from '../../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function summary(value) {
  if (!value) return null;
  return Object.entries(value)
    .map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}`)
    .join(' · ');
}

export default function AuditLog({ logs, filters, entities }) {
  const { data, setData, get, processing } = useForm({ q: filters.q ?? '', entity: filters.entity ?? '' });

  function submit(event) {
    event.preventDefault();
    get('/admin/audit-log', { preserveState: true });
  }

  return (
    <DashboardLayout eyebrow="Keamanan" title="Audit log">
      <Head title="Audit log" />

      <form onSubmit={submit} className="grid gap-3 border-b border-border pb-4 sm:grid-cols-[1fr_200px_auto] sm:items-end">
        <Field label="Cari aksi atau alasan" htmlFor="q">
          <Input id="q" value={data.q} onChange={(event) => setData('q', event.target.value)} placeholder="mis. sponsorship.admin_resolved" />
        </Field>
        <Field label="Jenis data" htmlFor="entity">
          <Select id="entity" value={data.entity} onChange={(event) => setData('entity', event.target.value)}>
            <option value="">Semua</option>
            {entities.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={buttonClasses()} disabled={processing}>
            {processing ? 'Menyaring…' : 'Terapkan'}
          </button>
          {filters.q || filters.entity ? (
            <Link href="/admin/audit-log" className={buttonClasses({ variant: 'outline' })}>
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <p className="mt-4 text-sm text-text-secondary-strong">
        <span className="font-medium tabular-nums text-text">{logs.total}</span> catatan · terbaru di atas
      </p>

      {logs.data.length > 0 ? (
        <>
          <div className="mt-2 divide-y divide-border">
            {logs.data.map((log) => (
              <div key={log.id} className="grid gap-1 py-3.5 sm:grid-cols-[1fr_170px] sm:gap-6">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">
                    {log.action} <span className="font-normal text-text-muted">· {log.entity}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary-strong">Oleh {log.actor ?? 'sistem'}</p>
                  {log.reason ? <p className="mt-1 text-xs leading-relaxed text-text-muted">{log.reason}</p> : null}
                  {log.before || log.after ? (
                    <p className="mt-1 break-words text-[11px] text-text-muted">
                      {summary(log.before) ? `Sebelum — ${summary(log.before)}` : ''}
                      {summary(log.before) && summary(log.after) ? '  →  ' : ''}
                      {summary(log.after) ? `Sesudah — ${summary(log.after)}` : ''}
                    </p>
                  ) : null}
                </div>
                <p className="text-xs tabular-nums text-text-muted sm:text-right">{formatDateTime(log.created_at)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Pagination paginator={logs} />
          </div>
        </>
      ) : (
        <EmptyState className="mt-6" title="Belum ada catatan audit" description="Tindakan verifikasi, moderasi, dan perubahan status akan tercatat di sini." />
      )}
    </DashboardLayout>
  );
}
