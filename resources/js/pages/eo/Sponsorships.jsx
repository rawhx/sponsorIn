import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronRight, Handshake, Filter } from 'lucide-react';
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
    router.get('/eo/sponsorships', {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  const countRows = [
    { key: '', label: 'Semua Kerja Sama', value: (counts.active ?? 0) + (counts.pending ?? 0) + (counts.completed ?? 0) },
    { key: 'active', label: 'Aktif Berjalan', value: counts.active ?? 0 },
    { key: 'completion_requested', label: 'Menunggu Konfirmasi', value: counts.pending ?? 0 },
    { key: 'completed', label: 'Tuntas Selesai', value: counts.completed ?? 0 },
  ];

  return (
    <DashboardLayout
      eyebrow="Ruang Kerja EO"
      title="Manajemen Kerja Sama"
      description="Kelola kontrak sponsorship yang sedang berjalan, koordinasi chat, hingga proses serah terima."
      actions={null}
    >
      <Head title="Manajemen Kerja Sama EO" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        <div className="min-w-0 space-y-5">
          {/* Filter Card */}
          <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-end">
            <Field label="Filter Status Kerja Sama" htmlFor="status" className="flex-1">
              <Select id="status" value={data.status} onChange={(event) => setData('status', event.target.value)}>
                <option value="">Semua Status</option>
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

          {/* List Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <p className="text-sm font-medium text-slate-600">
              Menampilkan <span className="font-bold text-slate-900 tabular-nums">{sponsorships.total}</span> kerja sama
            </p>
            <p className="text-xs text-slate-400">Paling baru diperbarui di atas</p>
          </div>

          {sponsorships.data.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
              {sponsorships.data.map((sponsorship) => (
                <Link
                  key={sponsorship.id}
                  href={`/eo/sponsorships/${sponsorship.id}`}
                  className="group flex items-center justify-between gap-4 p-4 sm:p-5 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Handshake className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="truncate text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {sponsorship.event_title}
                        </p>
                        <StatusBadge status={sponsorship.status} />
                      </div>
                      <p className="truncate text-xs sm:text-sm text-slate-600 font-medium">
                        Mitra Sponsor: <span className="text-slate-800">{sponsorship.counterpart}</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-400 tabular-nums">
                        Terakhir aktif: {formatDateTime(sponsorship.updated_at)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              illustration="handshake"
              title="Belum ada kerja sama sponsorship aktif"
              description="Kerja sama akan tercatat otomatis di sini segera setelah kesepakatan proposal disetujui bersama mitra brand sponsor."
            />
          )}

          {sponsorships.data.length > 0 && (
            <Pagination paginator={sponsorships} />
          )}
        </div>

        {/* Aside summary */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Ringkasan Kontrak</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {countRows.map((row) => (
                <Link
                  key={row.label}
                  href={row.key === '' ? '/eo/sponsorships' : `/eo/sponsorships?status=${row.key}`}
                  className="flex items-center justify-between py-2.5 text-sm font-medium transition-colors hover:text-emerald-700"
                >
                  <span className="text-slate-600">{row.label}</span>
                  <span className="tabular-nums font-bold text-slate-900">{row.value}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-xs leading-relaxed text-slate-500">
              Setelah seluruh hak promosi dan kewajiban dipenuhi, gunakan tombol <strong>Minta Penyelesaian</strong> di halaman detail kerja sama.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
