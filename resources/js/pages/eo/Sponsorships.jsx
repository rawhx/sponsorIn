import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronRight, Handshake } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Select } from '../../components/Form';
import { formatDate } from '../../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Sponsorships({ sponsorships, filters, counts, statuses }) {
  const { data, setData, get, processing } = useForm({
    status: filters.status ?? '',
  });

  function submit(event) {
    event.preventDefault();
    get('/eo/sponsorships', { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    setData('status', '');
    router.get('/eo/sponsorships', {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  const countRows = [
    { key: '', label: 'Semua', value: (counts.active ?? 0) + (counts.pending ?? 0) + (counts.completed ?? 0) },
    { key: 'active', label: 'Aktif', value: counts.active ?? 0 },
    { key: 'completion_requested', label: 'Menunggu konfirmasi', value: counts.pending ?? 0 },
    { key: 'completed', label: 'Selesai', value: counts.completed ?? 0 },
  ];

  return (
    <DashboardLayout
      eyebrow="Kesepakatan"
      title="Kerja Sama"
      actions={null}
    >
      <Head title="Kerja Sama" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
        <div className="min-w-0">
          <form onSubmit={submit} className="flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-4 sm:flex-row sm:items-end">
            <Field label="Status" htmlFor="status" className="flex-1">
              <Select id="status" value={data.status} onChange={(event) => setData('status', event.target.value)}>
                <option value="">Semua status</option>
                {statuses.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <button type="submit" className={buttonClasses()} disabled={processing}>
                {processing ? 'Menyaring…' : 'Terapkan'}
              </button>
              {data.status ? (
                <button type="button" onClick={reset} className={buttonClasses({ variant: 'outline' })}>Reset filter</button>
              ) : null}
            </div>
          </form>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <p className="text-sm text-text-secondary-strong">
              <span className="font-medium tabular-nums text-text">{sponsorships.total}</span> kerja sama
            </p>
            <p className="text-xs text-text-muted">Terbaru diperbarui di atas</p>
          </div>

          {sponsorships.data.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {sponsorships.data.map((sponsorship) => (
                  <Link
                    key={sponsorship.id}
                    href={`/eo/sponsorships/${sponsorship.id}`}
                    className="group flex items-center gap-4 py-4 hover:bg-hover"
                  >
                    <span className="mt-0.5 shrink-0 text-text-muted" aria-hidden="true">
                      <Handshake className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">{sponsorship.event_title}</p>
                        <StatusBadge status={sponsorship.status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-text-secondary-strong">
                        {sponsorship.role === 'sponsor' ? 'EO' : 'Sponsor'} · {sponsorship.counterpart}
                      </p>
                      <p className="mt-0.5 text-[11px] tabular-nums text-text-muted">{formatDateTime(sponsorship.updated_at)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
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
              illustration="handshake"
              title="Belum ada kerja sama"
              description="Kerja sama aktif akan muncul di sini setelah proposal disetujui dan dicatat."
            />
          )}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-background-muted p-4">
            <h2 className="text-sm font-semibold text-text">Ringkasan</h2>
            <div className="mt-3 divide-y divide-border">
              {countRows.map((row) => (
                <Link
                  key={row.label}
                  href={row.key === '' ? '/eo/sponsorships' : `/eo/sponsorships?status=${row.key}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-text"
                >
                  <span className="text-text-secondary-strong">{row.label}</span>
                  <span className="tabular-nums text-text">{row.value}</span>
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Permintaan penyelesaian memerlukan persetujuan pihak lain. Jika tidak ada respons dalam 7 hari, akan dialihkan ke peninjauan admin.
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}
