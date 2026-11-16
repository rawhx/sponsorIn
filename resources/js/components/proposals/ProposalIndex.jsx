import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronRight, Filter } from 'lucide-react';
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
}) {
  const { data, setData, get, processing } = useForm({
    status: filters.status ?? '',
  });

  function submit(event) {
    event.preventDefault();
    get(basePath, { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    router.get(basePath, {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  const countRows = [
    { key: '', label: 'Semua Proposal', value: counts.outgoing ?? 0 },
    { key: 'open', label: 'Sedang Berjalan', value: counts.open ?? 0 },
  ];

  return (
    <DashboardLayout
      eyebrow={eyebrow}
      title={title}
    >
      <Head title={title} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        <div className="min-w-0 space-y-5">
          {/* Filter card */}
          <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-end">
            <Field label="Filter Status" htmlFor="status" className="flex-1">
              <Select id="status" value={data.status} onChange={(event) => setData('status', event.target.value)}>
                <option value="">Semua status proposal</option>
                {statuses.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <button type="submit" className={buttonClasses({ size: 'md' })} disabled={processing}>
                <Filter className="h-4 w-4" />
                {processing ? 'Menyaring…' : 'Terapkan'}
              </button>
              {data.status ? (
                <button type="button" onClick={reset} className={buttonClasses({ variant: 'outline', size: 'md' })}>
                  Reset
                </button>
              ) : null}
            </div>
          </form>

          {/* List count header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <p className="text-sm font-medium text-slate-600">
              Menampilkan <span className="font-bold text-slate-900 tabular-nums">{proposals.total}</span> proposal
            </p>
            <p className="text-xs text-slate-400">Paling baru diperbarui di atas</p>
          </div>

          {proposals.data.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
              {proposals.data.map((proposal) => (
                <Link
                  key={proposal.id}
                  href={`${basePath}/${proposal.id}`}
                  className="group flex items-center justify-between gap-4 p-4 sm:p-5 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="truncate text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {proposal.event_title}
                      </p>
                      <StatusBadge status={proposal.status} />
                    </div>
                    <p className="truncate text-xs sm:text-sm text-slate-600">
                      {proposal.counterpart} · {proposal.requested_support}
                    </p>
                    <p className="mt-1 text-xs text-slate-400 tabular-nums">
                      Diperbarui: {formatDateTime(proposal.last_status_at)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada proposal"
              description="Proposal yang Anda kirim atau terima akan muncul di sini beserta riwayat status terkini."
            />
          )}

          {proposals.data.length > 0 && (
            <Pagination paginator={proposals} />
          )}
        </div>

        {/* Aside summary */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Ringkasan Proposal</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {countRows.map((row) => (
                <Link
                  key={row.label}
                  href={row.key === '' ? basePath : `${basePath}?status=sent`}
                  className="flex items-center justify-between py-2.5 text-sm font-medium transition-colors hover:text-emerald-700"
                >
                  <span className="text-slate-600">{row.label}</span>
                  <span className="tabular-nums font-bold text-slate-900">{row.value}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-xs leading-relaxed text-emerald-800">
              💡 <strong>Tips:</strong> Proposal yang disetujui kedua belah pihak akan otomatis dikonversikan menjadi kontrak kerja sama aktif di menu <strong>Manajemen Kerja Sama</strong>.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
