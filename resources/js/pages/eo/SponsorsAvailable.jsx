import { Head, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
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
  const { data, setData, get, processing } = useForm({
    q: filters.q ?? '',
    preference: filters.preference ?? '',
  });

  function submit(event) {
    event.preventDefault();
    get('/sponsors/available', { preserveState: true, preserveScroll: true, replace: true });
  }

  function reset() {
    get('/sponsors/available', { preserveState: false, preserveScroll: true, replace: true });
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.08em] text-text-muted">SPONSOR</p>
          <h1 className="mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-text">
            Daftar sponsor yang bisa dioleh.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary-strong">
            Tampilkan semua organisasi dengan tipe sponsor yang sudah terverifikasi dan punya
            preferensi proposal terbuka, selektif, atau tertutup.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative min-w-0 flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <Field
            label="Cari"
            htmlFor="q"
            className="w-full!"
            error={errors.q}
          >
            <Input
              id="q"
              value={data.q}
              onChange={(event) => setData('q', event.target.value)}
              placeholder="Nama atau lokasi"
            />
          </Field>
        </div>

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

        <button
          type="submit"
          className={buttonClasses()}
          disabled={processing}
        >
          {processing ? 'Menyaring…' : 'Terapkan'}
        </button>

        {data.q || data.preference ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm text-text-secondary-strong transition-colors hover:bg-hover hover:text-text"
          >
            Hapus filter
          </button>
        ) : null}
      </form>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <p className="text-sm text-text-secondary-strong">
            <span className="font-medium tabular-nums text-text">{filtered.length}</span> sponsor
            <span className="hidden text-text-muted sm:inline"> yang cocok dengan filter</span>
          </p>
          <p className="text-xs text-text-muted">
            Urut berdasarkan nama, lalu lokasi. Hanya tampilkan data yang bisa dilihat EO.
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

                <p className="mt-1 text-sm text-text-secondary-strong">
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
          <div className="mt-8 rounded-[14px] border border-border bg-surface p-6 text-center">
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
