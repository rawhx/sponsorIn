import { Head, Link, useForm } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { buttonClasses } from '../../components/Button';
import { EvidenceTag } from '../../components/StatusBadge';
import { Field, Input, Select } from '../../components/Form';
import { formatDateRange } from '../../lib/utils';

export default function Events({ events, filters, categories = [], supportTypes = [] }) {
  const { data, setData, get, processing } = useForm({
    q: filters.q ?? '',
    category: filters.category ?? '',
    location: filters.location ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    support_type: filters.support_type ?? '',
  });

  const hasFilters = Object.values(data).some(Boolean);

  function submit(event) {
    event.preventDefault();
    get('/sponsor/events', { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    get('/sponsor/events', { preserveState: false, preserveScroll: true, replace: true });
  }

  return (
    <DashboardLayout
      eyebrow="Peluang sponsorship"
      title="Daftar Peluang"
      description="Jelajahi event yang membuka kesempatan kerja sama sponsorship."
      className="bg-background"
    >
      <Head title="Daftar Peluang" />
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.08em] text-text-muted">PELUANG SPONSORSHIP</p>
          <h1 className="mt-3 text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-text">
            Jelajahi event yang membuka kesempatan kerja sama
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary-strong">
            Filter berdasarkan kategori, lokasi, tanggal, atau jenis dukungan. Setiap event
            menampilkan jumlah bukti audiens, paket yang tersedia, dan detail organizer.
          </p>
        </div>

        <form onSubmit={submit} className="mt-10 rounded-[12px] border border-border bg-surface p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Kata kunci" htmlFor="q" className="lg:col-span-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                <Input
                  id="q"
                  value={data.q}
                  onChange={(event) => setData('q', event.target.value)}
                  placeholder="Nama event, kota, atau topik"
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Kategori" htmlFor="category">
              <Select id="category" value={data.category} onChange={(event) => setData('category', event.target.value)}>
                <option value="">Semua kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </Field>
            <Field label="Jenis dukungan" htmlFor="support_type">
              <Select id="support_type" value={data.support_type} onChange={(event) => setData('support_type', event.target.value)}>
                <option value="">Semua jenis</option>
                {supportTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Lokasi" htmlFor="location">
              <Input
                id="location"
                value={data.location}
                onChange={(event) => setData('location', event.target.value)}
                placeholder="Kota atau wilayah"
              />
            </Field>
            <Field label="Mulai tanggal" htmlFor="date_from">
              <Input id="date_from" type="date" value={data.date_from} onChange={(event) => setData('date_from', event.target.value)} />
            </Field>
            <Field label="Sampai tanggal" htmlFor="date_to">
              <Input id="date_to" type="date" value={data.date_to} onChange={(event) => setData('date_to', event.target.value)} />
            </Field>
            <div className="flex items-end gap-2">
              <button type="submit" className={buttonClasses({ className: 'flex-1' })} disabled={processing}>
                {processing ? 'Menyaring…' : 'Terapkan'}
              </button>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-border bg-surface text-text-secondary-strong hover:bg-hover hover:text-text"
                  aria-label="Hapus filter"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="mt-8 flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <p className="text-sm text-text-secondary-strong">
            <span className="font-medium text-text tabular-nums">{events.total}</span> event ditemukan
          </p>
          <p className="text-xs text-text-muted">Diurutkan dari tanggal terdekat</p>
        </div>

        {events.data.length > 0 ? (
          <>
            <div className="divide-y divide-border">
              {events.data.map((event) => (
                <Link
                  key={event.id}
                  href={`/sponsor/events/${event.slug}`}
                  className="group grid gap-4 py-6 sm:grid-cols-[160px_1fr] sm:gap-8"
                >
                  <div>
                    <p className="text-sm font-medium leading-relaxed tabular-nums text-text">
                      {formatDateRange(event.date_start, event.date_end)}
                    </p>
                    <p className="mt-1.5 text-xs text-text-secondary-strong">{event.location}</p>
                    <p className="mt-3 text-xs text-text-muted">{event.category}</p>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold leading-snug tracking-[-0.015em] text-text group-hover:text-primary-strong">
                      {event.title}
                    </h2>
                    <p className="mt-1 text-sm text-text-secondary-strong">{event.organizer}</p>
                    {event.audience_summary ? (
                      <p className="mt-2.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-text-secondary-strong">
                        {event.audience_summary}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <EvidenceTag>{event.evidence_count} bukti audiens</EvidenceTag>
                      <EvidenceTag>{event.package_count} paket</EvidenceTag>
                      {event.support_needs ? <EvidenceTag>{event.support_needs}</EvidenceTag> : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Pagination paginator={events} />
            </div>
          </>
        ) : (
          <EmptyState
            className="mt-8"
            illustration="search"
            title="Belum ada event yang cocok"
            description="Coba longgarkan filter, ubah rentang tanggal, atau hapus kata kunci."
            action={
              hasFilters ? (
                <button type="button" onClick={reset} className={buttonClasses({ variant: 'outline' })}>
                  Hapus semua filter
                </button>
              ) : null
            }
          />
        )}
      </section>
    </DashboardLayout>
  );
}
