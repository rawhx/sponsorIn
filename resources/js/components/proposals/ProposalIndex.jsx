import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
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

export default function ProposalIndex({
  title,
  eyebrow,
  basePath,
  proposals,
  filters,
  counts,
  statuses,
  createHref,
}) {
  const { data, setData, get, processing } = useForm({
    status: filters.status ?? '',
  });

  function submit(event) {
    event.preventDefault();
    get(basePath, { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    setData('status', '');
    router.get(basePath, {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  const countRows = [
    { key: '', label: 'Semua', value: counts.outgoing ?? 0 },
    { key: 'open', label: 'Masih berjalan', value: counts.open ?? 0 },
  ];

  return (
    <DashboardLayout
      eyebrow={eyebrow}
      title={title}
      actions={
        createHref ? (
          <Link href={createHref} className={buttonClasses()}>
            Buat proposal
          </Link>
        ) : null
      }
    >
      <Head title={title} />

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
              <span className="font-medium tabular-nums text-text">{proposals.total}</span> proposal
            </p>
            <p className="text-xs text-text-muted">Terbaru diperbarui di atas</p>
          </div>

          {proposals.data.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {proposals.data.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={`${basePath}/${proposal.id}`}
                    className="group flex items-center gap-4 py-4 hover:bg-hover"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">{proposal.event_title}</p>
                        <StatusBadge status={proposal.status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-text-secondary-strong">
                        {proposal.counterpart} · {proposal.requested_support}
                      </p>
                      <p className="mt-0.5 text-[11px] tabular-nums text-text-muted">{formatDateTime(proposal.last_status_at)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className="mt-5">
                <Pagination paginator={proposals} />
              </div>
            </>
          ) : (
            <EmptyState
              className="mt-6"
              title="Belum ada proposal"
              description="Proposal yang Anda kirim atau terima akan muncul di sini beserta status terkini."
              action={createHref ? <Link href={createHref} className={buttonClasses()}>Buat proposal</Link> : null}
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
                  href={row.key === '' ? basePath : `${basePath}?status=sent`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-text"
                >
                  <span className="text-text-secondary-strong">{row.label}</span>
                  <span className="tabular-nums text-text">{row.value}</span>
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Proposal diterima tidak otomatis menjadi kesepakatan. Kedua pihak harus mengonfirmasi ringkasan sebelum kerja sama dicatat.
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}
