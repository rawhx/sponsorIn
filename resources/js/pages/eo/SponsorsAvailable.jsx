import { Head, Link, router, useForm } from '@inertiajs/react';
import { MapPin, Search, SlidersHorizontal, Building2, Send, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { buttonClasses } from '../../components/Button';
import { EvidenceTag } from '../../components/StatusBadge';
import { Field, Input } from '../../components/Form';

const preferenceLabels = {
  open: 'Menerima Proposal',
  selective: 'Selektif',
  closed: 'Tertutup',
};

const preferenceTones = {
  open: 'success',
  selective: 'info',
  closed: 'neutral',
};

export default function SponsorsAvailable({
  sponsors,
  filters,
  preferences,
}) {
  const { data, setData, get, processing, errors } = useForm({
    q: filters.q ?? '',
    preference: filters.preference ?? '',
  });

  function submit(event) {
    event.preventDefault();
    get('/eo/sponsors/available', { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    router.get('/eo/sponsors/available', {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  const filtered = sponsors.filter((sponsor) => {
    const q = (data.q ?? '').trim().toLowerCase();
    if (!q) return true;
    if (sponsor.name.toLowerCase().includes(q)) return true;
    if (sponsor.location?.toLowerCase().includes(q)) return true;
    return false;
  });

  return (
    <DashboardLayout
      eyebrow="Eksplorasi Brand Mitra"
      title="Sponsor Tersedia"
      description="Temukan brand sponsor aktif yang terbuka untuk menerima pengajuan proposal event."
    >
      <Head title="Sponsor Tersedia" />

      {/* Filter Card */}
      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <div className="min-w-0">
            <Field
              label="Cari Brand / Lokasi"
              htmlFor="q"
              className="w-full"
              error={errors.q}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <Input
                  id="q"
                  value={data.q}
                  onChange={(event) => setData('q', event.target.value)}
                  placeholder="Ketik nama brand atau kota domisili..."
                  className="pl-10"
                />
              </div>
            </Field>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-700">Preferensi Penerimaan</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`inline-flex h-10 shrink-0 items-center justify-center rounded-lg border px-3 text-xs sm:text-sm font-medium transition-all ${
                  !data.preference
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setData('preference', '')}
              >
                Semua
              </button>
              {Object.entries(preferences).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`inline-flex h-10 shrink-0 items-center justify-center rounded-lg border px-3 text-xs sm:text-sm font-medium transition-all ${
                    data.preference === value
                      ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setData('preference', value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="submit"
              className={buttonClasses({ size: 'md' })}
              disabled={processing}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              {processing ? 'Menyaring…' : 'Terapkan'}
            </button>
            {data.q || data.preference ? (
              <button
                type="button"
                onClick={reset}
                className={buttonClasses({ variant: 'outline', size: 'md' })}
                title="Reset filter"
              >
                <X className="h-4 w-4" />
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <section className="mt-8">
        <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
          <p className="text-sm font-medium text-slate-600">
            Ditemukan <span className="font-bold text-slate-900 tabular-nums">{filtered.length}</span> brand sponsor
          </p>
          <p className="text-xs text-slate-400">
            Terverifikasi & siap menerima proposal resmi
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <EvidenceTag tone={preferenceTones[sponsor.preference]}>
                      {preferenceLabels[sponsor.preference]}
                    </EvidenceTag>
                  </div>

                  <h2 className="mt-4 text-base font-bold text-slate-900">{sponsor.name}</h2>

                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {sponsor.location || 'Lokasi tidak disebutkan'}
                  </p>

                  {sponsor.contact ? (
                    <p className="mt-2 text-xs text-slate-500 font-medium">
                      Narahubung: <span className="text-slate-700">{sponsor.contact}</span>
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <Link
                    href={`/eo/proposals/create?sponsor=${sponsor.id}`}
                    className={buttonClasses({ size: 'sm', className: 'w-full' })}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Ajukan Proposal ke Brand Ini
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <p className="text-base font-semibold text-slate-800">Tidak ada brand sponsor yang cocok</p>
            <p className="mt-1 text-sm text-slate-500">
              Coba sesuaikan kata kunci pencarian atau pilih filter preferensi lain.
            </p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
