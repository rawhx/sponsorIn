import { Head, Link, router, useForm } from '@inertiajs/react';
import { Calendar, Filter, MapPin, Search, Tag, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import Button, { buttonClasses } from '../../components/Button';
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
    get(window.location.pathname, { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    router.get(window.location.pathname, {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  return (
    <DashboardLayout
      eyebrow="Peluang sponsorship"
      title="Daftar Peluang Event"
      description="Jelajahi event aktif yang membuka kesempatan kolaborasi sponsorship dengan data audiens terverifikasi."
    >
      <Head title="Daftar Peluang" />

      {/* Filter Card */}
      <div className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          <Filter className="h-3.5 w-3.5 text-primary" />
          Filter Peluang
        </div>
        <form onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <CitySelect
                id="location"
                value={data.location}
                onChange={(event) => setData('location', event.target.value)}
                placeholder="Pilih kota atau kabupaten"
              />
            </Field>
            <Field label="Dana minimum" htmlFor="min_price">
              <CurrencyInput
                id="min_price"
                value={data.min_price}
                onChange={(value) => setData('min_price', value)}
                placeholder="cth. 5.000.000"
              />
            </Field>
            <Field label="Dana maksimum" htmlFor="max_price">
              <CurrencyInput
                id="max_price"
                value={data.max_price}
                onChange={(value) => setData('max_price', value)}
                placeholder="cth. 50.000.000"
              />
            </Field>
            <Field label="Mulai tanggal" htmlFor="date_from">
              <Input id="date_from" type="date" value={data.date_from} onChange={(event) => setData('date_from', event.target.value)} />
            </Field>
            <Field label="Sampai tanggal" htmlFor="date_to">
              <Input id="date_to" type="date" value={data.date_to} onChange={(event) => setData('date_to', event.target.value)} />
            </Field>
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1" loading={processing}>
                Terapkan
              </Button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Hapus filter"
                  title="Hapus filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Meta header */}
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between border-b border-border/80 pb-4">
        <p className="text-sm text-text-secondary">
          Ditemukan <span className="font-semibold text-text tabular-nums">{events.total}</span> event tersedia
        </p>
        <p className="text-xs text-text-muted">Diurutkan berdasarkan tanggal pelaksanaan terdekat</p>
      </div>

      {/* Event list */}
      {events.data.length > 0 ? (
        <div className="mt-4 space-y-3">
          {events.data.map((event) => (
            <Link
              key={event.id}
              href={`/sponsor/events/${event.slug}`}
              className="group block rounded-2xl border border-border/70 bg-surface p-5 sm:p-6 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <div className="space-y-1.5 border-b border-border/50 pb-3 sm:border-b-0 sm:border-r sm:border-border/60 sm:pb-0 sm:pr-6">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDateRange(event.date_start, event.date_end)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin className="h-3.5 w-3.5 text-text-muted" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-text-muted">
                      <Tag className="h-3 w-3" />
                      {event.category}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">
                      {event.title}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary font-medium">Oleh {event.organizer}</p>
                  {event.audience_summary && (
                    <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                      {event.audience_summary}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {event.price_min !== null && event.price_min !== undefined ? (
                      <EvidenceTag tone="success">Mulai dari {formatCurrency(event.price_min)}</EvidenceTag>
                    ) : (
                      <EvidenceTag tone="warning">Dana negosiasi</EvidenceTag>
                    )}
                    <EvidenceTag tone="primary">{event.evidence_count} bukti audiens</EvidenceTag>
                    <EvidenceTag>{event.package_count} paket sponsorship</EvidenceTag>
                    {event.support_needs && (
                      <EvidenceTag tone="neutral">{event.support_needs}</EvidenceTag>
                    )}
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
        <div className="mt-6">
          <EmptyState
            illustration="search"
            title="Belum ada event yang cocok"
            description="Coba longgarkan filter pencarian, ubah rentang tanggal, atau bersihkan kata kunci."
            action={
              hasFilters ? (
                <Button type="button" variant="outline" onClick={reset}>
                  Hapus semua filter
                </Button>
              ) : null
            }
          />
        </div>
      )}
    </DashboardLayout>
  );
}
