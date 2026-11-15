import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react';
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

function entityTone(type) {
  const map = {
    sponsor_verification: 'warning',
    event: 'info',
    review: 'danger',
    sponsorship: 'success',
    proposal: 'primary',
    report: 'neutral',
  };
  return map[type] ?? 'neutral';
}

function actionTone(action) {
  const map = {
    'review.published': 'success',
    'review.hidden': 'danger',
    'review.edited': 'info',
    'sponsorship.active': 'success',
    'sponsorship.completion_requested': 'warning',
    'sponsorship.completed': 'success',
    'sponsorship.disputed': 'danger',
    'sponsorship.needs_admin_review': 'warning',
    'sponsor_verification.submitted': 'info',
    'sponsor_verification.approved': 'success',
    'sponsor_verification.rejected': 'danger',
    'sponsor_verification.needs_information': 'warning',
    'event.approved': 'success',
    'event.needs_changes': 'warning',
    'event.rejected': 'danger',
    'event.unpublished': 'neutral',
    'report.approved': 'success',
    'report.needs_information': 'warning',
    'report.rejected': 'danger',
    'report.dismissed': 'neutral',
  };
  return map[action] ?? 'neutral';
}

export default function AdminAuditLog({ logs, filters }) {
  return (
    <DashboardLayout
      eyebrow="Jejak audit internal"
      title="Audit log"
      actions={null}
    >
      <Head title="Audit log" />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        <div className="min-w-0">
          <div className="flex flex-col gap-4 rounded-[12px] border border-border bg-surface p-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Cari aksi" htmlFor="action">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                  <Input
                    id="action"
                    name="action"
                    value={filters.action ?? ''}
                    onChange={(event) => {}}
                    placeholder="Cari nama aksi…"
                  />
                </div>
              </Field>
            </div>
            <div className="flex gap-2">
              <Field label="Entitas" htmlFor="entity" className="flex-1">
                <Select
                  id="entity"
                  value={filters.entity ?? ''}
                  onChange={(event) => {}}
                >
                  <option value="">Semua entitas</option>
                  <option value="sponsor_verification">Verifikasi sponsor</option>
                  <option value="event">Event</option>
                  <option value="review">Ulasan</option>
                  <option value="sponsorship">Kerja sama</option>
                  <option value="proposal">Proposal</option>
                  <option value="report">Laporan</option>
                </Select>
              </Field>
              <button type="submit" className={buttonClasses()}>Terapkan</button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3 border-b border-border pb-3">
            <p className="text-2xl font-semibold tabular-nums text-text">{logs.total}</p>
            <p className="text-xs text-text-secondary-strong">riwayat tindakan tersimpan</p>
          </div>

          {logs.data.length > 0 ? (
            <div className="mt-5 divide-y divide-border">
              {logs.data.map((log) => (
                <div key={log.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">
                        {entityTone(log.entity_type)}
                        <span className="ml-1.5 text-xs text-text-muted">{log.entity_type}</span>
                        <span className="text-xs text-text-muted">#{log.entity_id}</span>
                      </p>
                      <StatusBadge status="neutral" tone={actionTone(log.action)} />
                    </div>
                    <p className="mt-1 text-sm text-text-secondary-strong">{log.action}</p>
                    <p className="mt-2 text-xs text-text-muted">
                      {formatDateTime(log.created_at)} · Oleh{' '}
                      <span className="text-text">{log.actor ?? 'sistem'}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3 sm:ml-6">
                    {Object.entries(log.before ?? {}).map(([k, v]) => (
                      <span key={k} className="text-xs text-text-secondary-strong">
                        {k}: {JSON.stringify(v)}
                      </span>
                    ))}
                    <Link
                      href={`/admin/audit-log/${log.id}`}
                      className={buttonClasses({ variant: 'outline', size: 'sm' })}
                    >
                      Lihat detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[12px] border border-dashed border-border px-6 py-10 text-center">
              <svg className="mx-auto h-10 w-10 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="mt-4 text-sm font-medium text-text">Belum ada aktivitas tercatat</p>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-text-secondary-strong">
                Tindakan admin, verifikasi, moderasi, dan perubahan status ditampilkan di sini.
              </p>
            </div>
          )}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Pengenal di log</h2>
            <div className="mt-3 divide-y divide-border">
              {Object.entries({
                sponsor_verification: 'Verifikasi sponsor',
                event: 'Event',
                review: 'Ulasan',
                sponsorship: 'Kerja sama',
                proposal: 'Proposal',
                report: 'Laporan',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-text-secondary-strong">{label}</span>
                  <StatusBadge status="neutral" tone={entityTone(key)} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[12px] border border-border bg-background-muted p-5">
            <h2 className="text-sm font-semibold text-text">Panduan</h2>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-text-secondary-strong">
              <li>Setiap perubahan status, keputusan, moderasi, dan penyelesaian dicatat.</li>
              <li>Kolom sebelum/sesudah menampilkan ringkasan perubahan.</li>
              <li>Nama actor diambil dari pengguna yang melakukan tindakan.</li>
            </ul>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
