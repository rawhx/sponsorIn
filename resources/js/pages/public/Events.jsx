import { Head, Link, router, useForm } from '@inertiajs/react';
import { Search, X, Calendar, MapPin } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { buttonClasses } from '../../components/Button';
import CitySelect from '../../components/CitySelect';
import { EvidenceTag } from '../../components/StatusBadge';
import { Field, Input, Select, CurrencyInput } from '../../components/Form';
import { formatCurrency, formatDateRange } from '../../lib/utils';

export default function Events({ events, filters, categories = [], supportTypes = [] }) {
  const { data, setData, get, processing } = useForm({
    q: filters.q ?? '',
    category: filters.category ?? '',
    location: filters.location ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    support_type: filters.support_type ?? '',
    min_price: filters.min_price ?? '',
    max_price: filters.max_price ?? '',
  });

  const hasFilters = Object.values(data).some(Boolean);

  function submit(event) {
    event.preventDefault();
    get('/events', { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    router.get('/events', {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  return (
    <PublicLayout>
      <Head title="Peluang Sponsorship" />
      <section className="mx-auto w-full max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Katalog Peluang Sponsorship</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Event terbuka yang siap menjalin kemitraan.
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            Saring event berdasarkan kategori, kota, tanggal, atau bentuk dukungan yang dibutuhkan. Setiap event dilengkapi dossier bukti audiens dan rincian paket sponsor.
          </p>
        </div>

        {/* Search & Filter Card */}
        <form onSubmit={submit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Kata Kunci" htmlFor="q" className="sm:col-span-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <Input
                  id="q"
                  value={data.q}
                  onChange={(event) => setData('q', event.target.value)}
                  placeholder="Nama event, topik, atau kata kunci..."
                  className="pl-10"
                />
              </div>
            </Field>
            <Field label="Kategori" htmlFor="category">
              <Select id="category" value={data.category} onChange={(event) => setData('category', event.target.value)}>
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </Field>
            <Field label="Bentuk Dukungan" htmlFor="support_type">
              <Select id="support_type" value={data.support_type} onChange={(event) => setData('support_type', event.target.value)}>
                <option value="">Semua Bentuk</option>
                {supportTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Lokasi / Kota" htmlFor="location">
              <CitySelect
                id="location"
                value={data.location}
                onChange={(event) => setData('location', event.target.value)}
                placeholder="Pilih kota atau kabupaten"
              />
            </Field>
            <Field label="Dana Minimum" htmlFor="min_price">
              <CurrencyInput
                id="min_price"
                value={data.min_price}
                onChange={(value) => setData('min_price', value)}
                placeholder="cth. 5.000.000"
              />
            </Field>
            <Field label="Dana Maksimum" htmlFor="max_price">
              <CurrencyInput
                id="max_price"
                value={data.max_price}
                onChange={(value) => setData('max_price', value)}
                placeholder="cth. 50.000.000"
              />
            </Field>
            <Field label="Mulai Dari" htmlFor="date_from">
              <Input id="date_from" type="date" value={data.date_from} onChange={(event) => setData('date_from', event.target.value)} />
            </Field>
            <Field label="Sampai Dengan" htmlFor="date_to">
              <Input id="date_to" type="date" value={data.date_to} onChange={(event) => setData('date_to', event.target.value)} />
            </Field>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
              <button type="submit" className={buttonClasses({ className: 'flex-1' })} disabled={processing}>
                {processing ? 'Menyaring…' : 'Terapkan Filter'}
              </button>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-10 sm:h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-2xs"
                  aria-label="Hapus filter"
                  title="Hapus filter"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="mt-8 flex items-baseline justify-between border-b border-slate-200 pb-3">
          <p className="text-sm font-medium text-slate-600">
            Ditemukan <span className="font-bold text-slate-900 tabular-nums">{events.total}</span> event sponsorship
          </p>
          <p className="text-xs text-slate-400">Urutan tanggal pelaksanaan terdekat</p>
        </div>

        {events.data.length > 0 ? (
          <div className="mt-6 space-y-4">
            {events.data.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md"
              >
                <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:gap-8">
                  <div className="space-y-2 border-b border-slate-100 pb-3 sm:border-b-0 sm:border-r sm:pr-6 sm:pb-0">
                    <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                      {event.category}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {event.location}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs font-medium tabular-nums text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDateRange(event.date_start, event.date_end)}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                      {event.title}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Diselenggarakan oleh: <span className="text-slate-700">{event.organizer}</span>
                    </p>
                    {event.audience_summary ? (
                      <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {event.audience_summary}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2 pt-2">
                      {event.price_min !== null && event.price_min !== undefined ? (
                        <EvidenceTag tone="success">Mulai dari {formatCurrency(event.price_min)}</EvidenceTag>
                      ) : (
                        <EvidenceTag tone="warning">Dana negosiasi</EvidenceTag>
                      )}
                      <EvidenceTag>{event.evidence_count} Bukti Audiens</EvidenceTag>
                      <EvidenceTag>{event.package_count} Paket Sponsor</EvidenceTag>
                      {event.support_needs ? <EvidenceTag>{event.support_needs}</EvidenceTag> : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <div className="pt-4">
              <Pagination paginator={events} />
            </div>
          </div>
        ) : (
          <EmptyState
            className="mt-8"
            illustration="search"
            title="Tidak ada event yang sesuai kriteria"
            description="Coba ubah kata kunci pencarian, sesuaikan filter kategori atau rentang tanggal."
            action={
              hasFilters ? (
                <button type="button" onClick={reset} className={buttonClasses({ variant: 'outline' })}>
                  Hapus Semua Filter
                </button>
              ) : null
            }
          />
        )}
      </section>
    </PublicLayout>
  );
}
