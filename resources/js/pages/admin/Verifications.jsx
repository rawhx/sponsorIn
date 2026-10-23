import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Select } from '../../components/Form';
import { formatDate } from '../../lib/utils';

const statusOptions = [
  { value: 'submitted', label: 'Diajukan' },
  { value: 'under_review', label: 'Sedang ditinjau' },
  { value: 'needs_information', label: 'Perlu informasi' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

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

export default function Verifications({ verifications, filters, counts }) {
  const { data, setData, get, processing } = useForm({
    status: filters.status ?? '',
  });

  function submit(event) {
    event.preventDefault();
    get('/admin/verifications', { preserveState: true, preserveScroll: true, replace: true });
  }

  const countRows = [
    { key: 'submitted', label: 'Diajukan', value: counts.submitted },
    { key: 'under_review', label: 'Sedang ditinjau', value: counts.under_review },
    { key: 'needs_information', label: 'Perlu informasi', value: counts.needs_information },
    { key: 'approved', label: 'Disetujui', value: counts.approved },
    { key: 'rejected', label: 'Ditolak', value: counts.rejected },
  ];

  return (
    <DashboardLayout eyebrow="Operasional platform" title="Verifikasi sponsor">
      <Head title="Verifikasi sponsor" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
        <div className="min-w-0">
          <form onSubmit={submit} className="flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-4 sm:flex-row sm:items-end">
            <Field label="Saring status" htmlFor="status" className="flex-1">
              <Select id="status" value={data.status} onChange={(event) => setData('status', event.target.value)}>
                <option value="">Semua status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <button type="submit" className={buttonClasses()} disabled={processing}>
                {processing ? 'Menyaring…' : 'Terapkan'}
              </button>
              {data.status ? (
                <Link href="/admin/verifications" className={buttonClasses({ variant: 'outline' })}>
                  Semua
                </Link>
              ) : null}
            </div>
          </form>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <p className="text-sm text-text-secondary-strong">
              <span className="font-medium tabular-nums text-text">{verifications.total}</span> pengajuan
            </p>
            <p className="text-xs text-text-muted">Terbaru di atas</p>
          </div>

          {verifications.data.length > 0 ? (
            <>
              <div className="hidden gap-4 border-b border-border pb-2 text-xs text-text-muted sm:grid sm:grid-cols-[1fr_150px_130px_20px]">
                <p>Organisasi</p>
                <p>Diajukan</p>
                <p>Status</p>
                <span />
              </div>
              <div className="divide-y divide-border">
                {verifications.data.map((verification) => (
                  <Link
                    key={verification.id}
                    href={`/admin/verifications/${verification.id}`}
                    className="group grid gap-3 py-4 hover:bg-hover sm:grid-cols-[1fr_150px_130px_20px] sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text group-hover:text-primary-strong">{verification.organization_name}</p>
                      <p className="mt-0.5 truncate text-xs text-text-secondary-strong">{verification.contact_name} · {verification.contact_email}</p>
                    </div>
                    <p className="text-xs tabular-nums text-text-secondary-strong">{formatDateTime(verification.submitted_at)}</p>
                    <StatusBadge status={verification.status} />
                    <ChevronRight className="hidden h-4 w-4 text-text-muted sm:block" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <div className="mt-5">
                <Pagination paginator={verifications} />
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[12px] border border-dashed border-border px-6 py-10 text-center">
              <p className="text-sm font-medium text-text">Tidak ada pengajuan pada filter ini</p>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-text-secondary-strong">Ubah filter status atau kembali ke seluruh antrean.</p>
            </div>
          )}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-background-muted p-4">
            <h2 className="text-sm font-semibold text-text">Ringkasan status</h2>
            <div className="mt-3 divide-y divide-border">
              {countRows.map((row) => (
                <Link
                  key={row.key}
                  href={`/admin/verifications?status=${row.key}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-text"
                >
                  <span className="text-text-secondary-strong">{row.label}</span>
                  <span className="tabular-nums text-text">{row.value}</span>
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Keputusan verifikasi memengaruhi akses fitur sponsor. Pastikan alasan publik ditulis jelas dan tidak memuat catatan internal.
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}
