import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, History, Search } from 'lucide-react';
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
  const { data, setData, get, processing } = useForm({
    action: filters.action ?? '',
    entity: filters.entity ?? '',
  });

  function submit(e) {
    e.preventDefault();
    get('/admin/audit-log', { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    router.get('/admin/audit-log', {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  return (
    <DashboardLayout
      eyebrow="Jejak audit internal"
      title="Audit Trail Log"
      description="Rekam jejak seluruh mutasi data, keputusan verifikasi, moderasi event, dan aksi operasional."
      actions={
        <Link href="/admin/dashboard" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
      }
    >
      <Head title="Audit Log" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        {/* Main Column */}
        <div className="min-w-0">
          <form
            onSubmit={submit}
            className="flex flex-col sm:flex-row sm:items-end gap-3 rounded-2xl border border-border/80 bg-surface p-4 shadow-xs"
          >
            <Field label="Cari Aksi" htmlFor="action" className="flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                <Input
                  id="action"
                  name="action"
                  value={data.action}
                  onChange={(event) => setData('action', event.target.value)}
                  placeholder="Misal: event.approved, verification…"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Tipe Entitas" htmlFor="entity" className="sm:w-48">
              <Select
                id="entity"
                value={data.entity}
                onChange={(event) => setData('entity', event.target.value)}
              >
                <option value="">Semua Entitas</option>
                <option value="sponsor_verification">Verifikasi Sponsor</option>
                <option value="event">Event</option>
                <option value="review">Ulasan</option>
                <option value="sponsorship">Kerja Sama</option>
                <option value="proposal">Proposal</option>
                <option value="report">Laporan</option>
              </Select>
            </Field>

            <div className="flex gap-2">
              <Button type="submit" loading={processing}>
                Saring
              </Button>
              {(data.action || data.entity) && (
                <Button type="button" variant="outline" onClick={reset}>
                  Reset
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 flex items-baseline justify-between gap-4 border-b border-border/80 pb-3">
            <p className="text-sm text-text-secondary">
              Total <span className="font-semibold text-text tabular-nums">{logs.total}</span> jejak aktivitas
            </p>
            <p className="text-xs text-text-muted">Aktivitas paling baru di urutan teratas</p>
          </div>

          {logs.data.length > 0 ? (
            <div className="mt-4 space-y-3">
              {logs.data.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 shadow-xs space-y-2.5 transition-all hover:border-primary/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-text">
                          {log.action}
                        </span>
                        <StatusBadge status="neutral" tone={actionTone(log.action)} />
                        <span className="rounded-md bg-background px-1.5 py-0.5 text-[11px] font-mono text-text-muted">
                          {log.entity_type} #{log.entity_id}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">
                        Dilakukan oleh: <strong className="font-medium text-text">{log.actor ?? 'Sistem'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="text-[11px] tabular-nums text-text-muted">
                        {formatDateTime(log.created_at)}
                      </span>
                      <Link
                        href={`/admin/audit-log/${log.id}`}
                        className={buttonClasses({ variant: 'outline', size: 'sm' })}
                      >
                        Detail
                      </Link>
                    </div>
                  </div>

                  {log.reason && (
                    <div className="rounded-xl bg-background/50 p-2.5 text-xs text-text-muted italic border border-border/40">
                      Alasan: {log.reason}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4">
                <Pagination paginator={logs} />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border/80 p-8 text-center">
              <History className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-3 text-sm font-semibold text-text">Belum ada jejak audit yang cocok</p>
              <p className="mt-1 text-xs text-text-secondary">Ubah filter kata kunci aksi atau tipe entitas.</p>
            </div>
          )}
        </div>

        {/* Aside Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Tipe Entitas Audit</h2>
            <div className="mt-3 divide-y divide-border/60">
              {Object.entries({
                sponsor_verification: 'Verifikasi Sponsor',
                event: 'Event',
                review: 'Ulasan',
                sponsorship: 'Kerja Sama',
                proposal: 'Proposal',
                report: 'Laporan',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-2 text-xs">
                  <span className="text-text-secondary">{label}</span>
                  <StatusBadge status="neutral" tone={entityTone(key)} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/60 p-5 text-xs text-text-secondary space-y-2">
            <h3 className="font-semibold text-text">Integritas Log</h3>
            <p className="leading-relaxed">
              Jejak audit bersifat append-only dan tidak dapat diubah atau dihapus untuk memastikan akuntabilitas kepatuhan sistem.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
