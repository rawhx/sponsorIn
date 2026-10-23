import { Head, Link, useForm } from '@inertiajs/react';
import { BadgeCheck, Building2, MapPin, Search, Star, X } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { buttonClasses } from '../../components/Button';
import { Field, Input } from '../../components/Form';

export default function Organizers({ organizers, filters }) {
  const { data, setData, get, processing } = useForm({
    q: filters.q ?? '',
    location: filters.location ?? '',
  });

  const hasFilters = Boolean(data.q || data.location);

  function submit(event) {
    event.preventDefault();
    get('/organizers', { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    get('/organizers', { preserveState: false, preserveScroll: true, replace: true });
  }

  return (
    <PublicLayout>
      <Head title="Pelaku event" />
      <section className="mx-auto w-full max-w-6xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.08em] text-text-muted">PELAKU EVENT</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-text">
            Organizer yang sedang membuka peluang.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary-strong">
            Kenali rekam jejak dan event aktif setiap EO sebelum mengirim minat atau proposal.
          </p>
        </div>

        <form onSubmit={submit} className="mt-10 flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-4 sm:flex-row sm:items-end sm:p-5">
          <Field label="Kata kunci" htmlFor="q" className="flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <Input id="q" value={data.q} onChange={(e) => setData('q', e.target.value)} placeholder="Nama atau fokus organizer" className="pl-9" />
            </div>
          </Field>
          <Field label="Lokasi" htmlFor="location" className="sm:w-56">
            <Input id="location" value={data.location} onChange={(e) => setData('location', e.target.value)} placeholder="Kota atau wilayah" />
          </Field>
          <div className="flex items-end gap-2">
            <button type="submit" className={buttonClasses()} disabled={processing}>
              {processing ? 'Menyaring…' : 'Terapkan'}
            </button>
            {hasFilters ? (
              <button type="button" onClick={reset} className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-border bg-surface text-text-secondary-strong hover:bg-hover hover:text-text" aria-label="Hapus filter">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-8 flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <p className="text-sm text-text-secondary-strong">
            <span className="font-medium tabular-nums text-text">{organizers.total}</span> organizer
          </p>
          <p className="text-xs text-text-muted">Diurutkan dari jumlah event terbit</p>
        </div>

        {organizers.data.length > 0 ? (
          <>
            <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {organizers.data.map((organizer) => (
                <Link
                  key={organizer.id}
                  href={`/organizers/${organizer.id}`}
                  className="group flex flex-col rounded-[12px] border border-border bg-surface p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-border bg-background-muted">
                      <Building2 className="h-5 w-5 text-primary-strong" aria-hidden="true" />
                    </span>
                    {organizer.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success-strong">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Terverifikasi
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-4 text-[16px] font-semibold text-text group-hover:text-primary-strong">{organizer.name}</h2>
                  {organizer.location ? (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-text-secondary-strong">
                      <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                      {organizer.location}
                    </p>
                  ) : null}
                  {organizer.description ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary-strong">{organizer.description}</p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4 text-xs text-text-secondary-strong">
                    <span className="tabular-nums">{organizer.event_count} event aktif</span>
                    {organizer.review_count > 0 ? (
                      <span className="inline-flex items-center gap-1 tabular-nums text-text">
                        <Star className="h-3.5 w-3.5 text-warning-strong" aria-hidden="true" />
                        {Number(organizer.rating_average).toFixed(1)} ({organizer.review_count})
                      </span>
                    ) : (
                      <span className="text-text-muted">Belum ada ulasan</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Pagination paginator={organizers} />
            </div>
          </>
        ) : (
          <EmptyState
            className="mt-8"
            illustration="search"
            title="Belum ada organizer yang cocok"
            description="Coba ubah kata kunci atau lokasi untuk menemukan EO lain."
            action={hasFilters ? <button type="button" onClick={reset} className={buttonClasses({ variant: 'outline' })}>Hapus filter</button> : null}
          />
        )}
      </section>
    </PublicLayout>
  );
}
