import { Head, Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, reportTargetLabels } from '../../lib/utils';

const statusTabs = [
  { key: '', label: 'Semua' },
  { key: 'open', label: 'Terbuka' },
  { key: 'in_review', label: 'Ditinjau' },
  { key: 'resolved', label: 'Selesai ditangani' },
  { key: 'dismissed', label: 'Ditolak' },
];

function href(status, targetType) {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (targetType) query.set('target_type', targetType);
  const qs = query.toString();
  return qs ? `/admin/reports?${qs}` : '/admin/reports';
}

export default function AdminReports({ reports, filters, counts }) {
  return (
    <DashboardLayout eyebrow="Moderasi" title="Laporan penyalahgunaan">
      <Head title="Laporan" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
        <div className="min-w-0">
          <nav className="flex flex-wrap gap-2 border-b border-border pb-3" aria-label="Filter status laporan">
            {statusTabs.map((tab) => {
              const active = (filters.status ?? '') === tab.key;
              return (
                <Link
                  key={tab.key || 'all'}
                  href={href(tab.key, filters.target_type)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? 'border-primary bg-primary/10 text-primary-strong' : 'border-border text-text-secondary-strong hover:bg-hover'}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <nav className="mt-2 flex flex-wrap gap-2" aria-label="Filter jenis laporan">
            {[{ key: '', label: 'Semua jenis' }, ...Object.entries(reportTargetLabels).map(([key, label]) => ({ key, label }))].map((tab) => {
              const active = (filters.target_type ?? '') === tab.key;
              return (
                <Link
                  key={tab.key || 'any'}
                  href={href(filters.status, tab.key)}
                  className={`rounded-full px-3 py-1 text-xs ${active ? 'bg-hover font-medium text-text' : 'text-text-secondary-strong hover:bg-hover'}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {reports.data.length > 0 ? (
            <>
              <div className="mt-3 divide-y divide-border">
                {reports.data.map((report) => (
                  <Link
                    key={report.id}
                    href={`/admin/reports/${report.id}`}
                    className="group grid gap-3 py-4 hover:bg-hover sm:grid-cols-[1fr_130px_20px] sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">
                        {reportTargetLabels[report.target_type]} · {report.reason}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-text-secondary-strong">
                        Pelapor: {report.reporter}
                        {report.assigned_admin ? ` · Ditangani: ${report.assigned_admin}` : ''}
                      </p>
                      <p className="mt-0.5 text-[11px] tabular-nums text-text-muted">{formatDate(report.created_at)}</p>
                    </div>
                    <StatusBadge status={report.status} />
                    <ChevronRight className="hidden h-4 w-4 text-text-muted sm:block" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className="mt-5">
                <Pagination paginator={reports} />
              </div>
            </>
          ) : (
            <EmptyState
              className="mt-6"
              title="Tidak ada laporan pada filter ini"
              description="Laporan event, akun, dan ulasan dari pengguna akan muncul di sini."
            />
          )}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-background-muted p-4">
            <h2 className="text-sm font-semibold text-text">Ringkasan status</h2>
            <dl className="mt-3 divide-y divide-border text-sm">
              {[
                ['Terbuka', counts.open],
                ['Ditinjau', counts.in_review],
                ['Selesai ditangani', counts.resolved],
                ['Ditolak', counts.dismissed],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <dt className="text-text-secondary-strong">{label}</dt>
                  <dd className="tabular-nums text-text">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Ulasan tetap tampil selama laporan ditinjau, kecuali ada indikasi pelanggaran berat. Semua tindak lanjut tercatat pada audit log.
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}
