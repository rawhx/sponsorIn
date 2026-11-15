import { Head, Link, router, useForm } from '@inertiajs/react';
import { MapPin, Search, SlidersHorizontal } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { buttonClasses } from '../../components/Button';
import { EvidenceTag } from '../../components/StatusBadge';
import { Field, Input } from '../../components/Form';
import { formatDate } from '../../lib/utils';

const preferenceLabels = {
  open: 'Menerima proposal',
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
    setData('q', '');
    setData('preference', '');
    router.get('/eo/sponsors/available', {}, { preserveState: false, preserveScroll: true, replace: true });
  }

  const filtered = sponsors.filter((sponsor) => {
    const q = (data.q ?? '').trim().toLowerCase();
    if (!q) return true;
    if (sponsor.name.toLowerCase().includes(q)) return true;
    if (sponsor.location?.toLowerCase().includes(q)) return true;
    return false;
  });

  const activePreference = data.preference ?? '';

  return (
    <DashboardLayout
      eyebrow="Sponsor"
      title="Sponsor tersedia"
      actions={
        <Link href="/eo/proposals/create" className={buttonClasses()}>
          Buat proposal
        </Link>
      }
    >
      <Head title="Sponsor tersedia" />

      <form
        onSubmit={submit}
        className="mt-8 rounded-[14px] border border-border bg-surface p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-[2.4rem] h-4 w-4 text-text-muted" aria-hidden="true" />
          <Field
            label="Cari"
            htmlFor="q"
            className="w-full"
            error={errors.q}
          >
            <Input
              id="q"
              value={data.q}
              onChange={(event) => setData('q', event.target.value)}
              placeholder="Nama atau lokasi"
              className="pl-9"
            />
          </Field>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-text">Preferensi</p>
          <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors ${
              !data.preference
                ? 'border-primary-strong bg-primary/10 text-primary-strong'
                : 'border-border bg-surface text-text-secondary-strong hover:bg-hover hover:text-text'
            }`}
            onClick={() => setData('preference', '')}
          >
            Semua
          </button>
          {Object.entries(preferences).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-medium transition-colors ${
                data.preference === value
                  ? 'bg-primary text-white'
                  : 'border border-border bg-surface text-text-secondary-strong hover:bg-hover hover:text-text'
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
            className={buttonClasses()}
            disabled={processing}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {processing ? 'Menyaring…' : 'Terapkan filter'}
          </button>
          {data.q || data.preference ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm text-text-secondary-strong transition-colors hover:bg-hover hover:text-text"
            >
              Reset
            </button>
          ) : null}
        </div>
        </div>
      </form>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <p className="text-sm text-text-secondary-strong">
            <span className="font-medium tabular-nums text-text">{filtered.length}</span> sponsor
            <span className="hidden text-text-muted sm:inline"> yang cocok dengan filter</span>
          </p>
          <p className="text-xs text-text-muted">
            Terverifikasi dan siap menerima proposal.
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex h-full flex-col rounded-[14px] border border-border bg-surface p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-border bg-background-muted text-primary-strong">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.5A3.5 3.5 0 0 0 21 15V11a9 9 0 1 0-18 0v4c0 .5.1 1 .3 1.4M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <EvidenceTag tone={preferenceTones[sponsor.preference]}>
                    {preferenceLabels[sponsor.preference]}
                  </EvidenceTag>
                </div>

                <h2 className="mt-4 text-[16px] font-semibold text-text">{sponsor.name}</h2>

                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-secondary-strong">
                  <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                  {sponsor.location || '—'}
                </p>

                {sponsor.contact ? (
                  <p className="mt-2 text-xs text-text-secondary-strong">
                    Kontak: {sponsor.contact}
                  </p>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/eo/proposals/create?sponsor=${sponsor.id}`}
                    className={buttonClasses({ size: 'sm', className: 'justify-center' })}
                  >
                    Kirim proposal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[14px] border border-border bg-surface p-6 text-center">
            <p className="text-sm font-medium text-text">Belum ada sponsor yang cocok</p>
            <p className="mt-1 text-sm text-text-secondary-strong">
              Coba ubah kata kunci, atau pilih preferensi lainnya.
            </p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
