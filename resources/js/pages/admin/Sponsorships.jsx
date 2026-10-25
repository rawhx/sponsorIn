import { Head, Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../lib/utils';

const tabs = [
  { key: '', label: 'Perlu keputusan' },
  { key: 'disputed', label: 'Sengketa' },
  { key: 'needs_admin_review', label: 'Tanpa respons 7 hari' },
  { key: 'completed', label: 'Selesai' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

export default function AdminSponsorships({ sponsorships, filters, counts }) {
  return (
    <DashboardLayout eyebrow="Moderasi" title="Sponsorship">
      <Head title="Sponsorship" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
        <div className="min-w-0">
          <nav className="flex flex-wrap gap-2 border-b border-border pb-3" aria-label="Filter status sponsorship">
            {tabs.map((tab) => {
              const active = (filters.status ?? '') === tab.key;
              return (
                <Link
                  key={tab.key || 'queue'}
                  href={tab.key ? `/admin/sponsorships?status=${tab.key}` : '/admin/sponsorships'}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? 'border-primary bg-primary/10 text-primary-strong' : 'border-border text-text-secondary-strong hover:bg-hover'}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {sponsorships.data.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {sponsorships.data.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/sponsorships/${item.id}`}
                    className="group grid gap-3 py-4 hover:bg-hover sm:grid-cols-[1fr_150px_20px] sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">{item.event_title}</p>
                      <p className="mt-0.5 truncate text-xs text-text-secondary-strong">Sponsor: {item.sponsor} · EO: {item.eo}</p>
                      {item.dispute_reason ? <p className="mt-1 text-xs text-text-muted">“{item.dispute_reason}”</p> : null}
                      <p className="mt-0.5 text-[11px] tabular-nums text-text-muted">Diperbarui {formatDate(item.updated_at)}</p>
                    </div>
                    <StatusBadge status={item.status} />
                    <ChevronRight className="hidden h-4 w-4 text-text-muted sm:block" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className="mt-5">
                <Pagination paginator={sponsorships} />
              </div>
            </>
          ) : (
            <EmptyState
              className="mt-6"
              title="Tidak ada sponsorship pada filter ini"
              description="Sponsorship yang disengketakan atau tanpa respons 7 hari akan muncul di antrean ini."
            />
          )}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-background-muted p-4">
            <h2 className="text-sm font-semibold text-text">Menunggu keputusan</h2>
            <dl className="mt-3 divide-y divide-border text-sm">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-text-secondary-strong">Sengketa</dt>
                <dd className="tabular-nums text-text">{counts.disputed}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-text-secondary-strong">Tanpa respons 7 hari</dt>
                <dd className="tabular-nums text-text">{counts.needs_admin_review}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Ulasan baru terbuka setelah sponsorship berstatus Selesai. Setiap keputusan tercatat pada audit log.
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}
