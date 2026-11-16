import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronRight, Handshake } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
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
    get('/sponsor/sponsorships', { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    router.get('/sponsor/sponsorships', {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  const countRows = [
    { key: '', label: 'Semua', value: (counts.active ?? 0) + (counts.pending ?? 0) + (counts.completed ?? 0) },
    { key: 'active', label: 'Aktif Berjalan', value: counts.active ?? 0 },
    { key: 'completion_requested', label: 'Menunggu Konfirmasi', value: counts.pending ?? 0 },
    { key: 'completed', label: 'Selesai', value: counts.completed ?? 0 },
  ];

  return (
    <DashboardLayout
      eyebrow="Kesepakatan"
      title="Kerja Sama Sponsorship"
      description="Kelola seluruh komitmen sponsorship yang telah disepakati bersama event organizer."
      actions={null}
    >
      <Head title="Kerja Sama" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        {/* Main Content Area */}
        <div className="min-w-0">
          <form
            onSubmit={submit}
            className="flex flex-col sm:flex-row sm:items-end gap-3 rounded-2xl border border-border/80 bg-surface p-4 shadow-xs"
          >
            <Field label="Status Kerja Sama" htmlFor="status" className="flex-1">
              <Select id="status" value={data.status} onChange={(event) => setData('status', event.target.value)}>
                <option value="">Semua Status</option>
                {statuses.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button type="submit" loading={processing}>
                Saring
              </Button>
              {data.status && (
                <Button type="button" variant="outline" onClick={reset}>
                  Reset
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 flex items-baseline justify-between gap-4 border-b border-border/80 pb-3">
            <p className="text-sm text-text-secondary">
              Total <span className="font-semibold text-text tabular-nums">{sponsorships.total}</span> kerja sama
            </p>
            <p className="text-xs text-text-muted">Diurutkan dari aktivitas terbaru</p>
          </div>

          {sponsorships.data.length > 0 ? (
            <div className="mt-4 space-y-2.5">
              {sponsorships.data.map((sponsorship) => (
                <Link
                  key={sponsorship.id}
                  href={`/sponsor/sponsorships/${sponsorship.id}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-surface p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-xs"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Handshake className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold text-text group-hover:text-primary transition-colors">
                          {sponsorship.event_title}
                        </p>
                        <StatusBadge status={sponsorship.status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-text-secondary">
                        {sponsorship.role === 'sponsor' ? 'Mitra EO' : 'Mitra Sponsor'}:{' '}
                        <strong className="font-medium text-text">{sponsorship.counterpart}</strong>
                      </p>
                      <p className="mt-1 text-[11px] tabular-nums text-text-muted">
                        Pembaruan terakhir: {formatDateTime(sponsorship.updated_at)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
              <div className="pt-4">
                <Pagination paginator={sponsorships} />
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                illustration="folder"
                title="Belum ada kerja sama sponsorship"
                description="Ketika kesepakatan proposal disetujui, kerja sama aktif akan tercatat di sini untuk dipantau deliverable-nya."
                action={
                  <Link href="/sponsor/events" className={buttonClasses()}>
                    Jelajahi Peluang Event
                  </Link>
                }
              />
            </div>
          )}
        </div>

        {/* Aside Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Status Kerja Sama</h2>
            <div className="mt-3 divide-y divide-border/60">
              {countRows.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => {
                    router.get('/sponsor/sponsorships', row.key ? { status: row.key } : {}, { preserveState: false, preserveScroll: true, replace: true });
                  }}
                  className={`flex w-full items-center justify-between py-2.5 text-xs text-left transition-colors hover:text-primary ${data.status === row.key ? 'font-semibold text-primary' : 'text-text-secondary'}`}
                >
                  <span>{row.label}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold tabular-nums text-text">
                    {row.value}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/60 p-5 text-xs text-text-secondary space-y-2">
            <h3 className="font-semibold text-text">Alur Penyelesaian</h3>
            <p className="leading-relaxed">
              Setelah event terlaksana, ajukan atau konfirmasi penyelesaian kerja sama. Anda dapat memberikan ulasan dan rating publik kepada EO dalam 24 jam.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
