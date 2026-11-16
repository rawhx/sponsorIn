import { Head, Link, router, useForm } from '@inertiajs/react';
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
    router.get('/organizers', {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  return (
    <PublicLayout>
      <Head title="Direktori Penyelenggara Event" />
      <section className="mx-auto w-full max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Direktori Penyelenggara</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Penyelenggara Event Profesional
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            Telusuri profil rekam jejak, kredibilitas, dan event aktif setiap EO sebelum mengirimkan penawaran sponsorship.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-end">
          <Field label="Cari Penyelenggara" htmlFor="q" className="flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input id="q" value={data.q} onChange={(e) => setData('q', e.target.value)} placeholder="Nama organisasi atau fokus event..." className="pl-10" />
            </div>
          </Field>
          <Field label="Kota / Wilayah" htmlFor="location" className="sm:w-64">
            <Input id="location" value={data.location} onChange={(e) => setData('location', e.target.value)} placeholder="Kota domisili..." />
          </Field>
          <div className="flex items-end gap-2">
            <button type="submit" className={buttonClasses({ size: 'md' })} disabled={processing}>
              {processing ? 'Menyaring…' : 'Cari'}
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
        </form>

        <div className="mt-8 flex items-baseline justify-between border-b border-slate-200 pb-3">
          <p className="text-sm font-medium text-slate-600">
            Ditemukan <span className="font-bold text-slate-900 tabular-nums">{organizers.total}</span> penyelenggara aktif
          </p>
          <p className="text-xs text-slate-400">Urutan event terbanyak</p>
        </div>

        {organizers.data.length > 0 ? (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {organizers.data.map((organizer) => (
                <Link
                  key={organizer.id}
                  href={`/organizers/${organizer.id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold">
                        <Building2 className="h-5 w-5" aria-hidden="true" />
                      </span>
                      {organizer.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
                          <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                          Terverifikasi
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700">{organizer.name}</h2>
                    {organizer.location ? (
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        {organizer.location}
                      </p>
                    ) : null}
                    {organizer.description ? (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{organizer.description}</p>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                    <span className="tabular-nums text-emerald-700">{organizer.event_count} Event Aktif</span>
                    {organizer.review_count > 0 ? (
                      <span className="inline-flex items-center gap-1 tabular-nums text-slate-900">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                        {Number(organizer.rating_average).toFixed(1)} ({organizer.review_count})
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">Belum ada ulasan</span>
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
            title="Tidak ada penyelenggara yang cocok"
            description="Coba ubah kata kunci pencarian atau sesuaikan lokasi untuk menemukan EO lain."
            action={hasFilters ? <button type="button" onClick={reset} className={buttonClasses({ variant: 'outline' })}>Hapus Filter</button> : null}
          />
        )}
      </section>
    </PublicLayout>
  );
}
