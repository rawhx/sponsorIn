import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Edit3, FileText, MapPin, Save, Star, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Input, Select, Textarea } from '../../components/Form';
import CitySelect from '../../components/CitySelect';
import { EvidenceTag } from '../../components/StatusBadge';
import { formatDateRange, legalFormLabels, proposalPreferenceLabels } from '../../lib/utils';

export default function EoProfile({
  organization,
  verifications,
  currentVerification,
  events,
  eventsCount,
  publishedEventsCount,
  reviews,
  totalRatings,
  averageRating,
  categories = [],
  locations = [],
}) {
  const [editing, setEditing] = useState(false);
  const form = useForm({
    display_name: organization?.name ?? '',
    description: organization?.description ?? '',
    category: organization?.category ?? '',
    location: organization?.location ?? '',
    proposal_preference: organization?.proposal_preference ?? '',
  });
  const active = verifications?.filter((v) => v.status === 'approved').length ?? 0;
  const pending = verifications?.filter((v) => v.status !== 'approved').length ?? 0;

  function startEditing() {
    form.setData({
      display_name: organization?.name ?? '',
      description: organization?.description ?? '',
      category: organization?.category ?? '',
      location: organization?.location ?? '',
      proposal_preference: organization?.proposal_preference ?? '',
    });
    setEditing(true);
  }

  function cancelEditing() {
    form.clearErrors();
    setEditing(false);
  }

  function submit(event) {
    event.preventDefault();
    form.put('/eo/profile', {
      preserveScroll: true,
      onSuccess: () => setEditing(false),
    });
  }

  return (
    <DashboardLayout
      eyebrow="Profil Event Organizer"
      title="Profil publik"
      actions={
        <div className="flex flex-wrap gap-2">
          {!editing ? (
            <button type="button" onClick={startEditing} className={buttonClasses({ variant: 'outline' })}>
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit profil
            </button>
          ) : (
            <button type="button" onClick={cancelEditing} className={buttonClasses({ variant: 'outline' })}>
              <X className="h-4 w-4" aria-hidden="true" />
              Batal
            </button>
          )}
        </div>
      }
    >
      <Head title="Profil publik" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div>
          {editing ? (
            <form onSubmit={submit} className="rounded-[12px] border border-border bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium tracking-[0.06em] text-text-muted">EDIT PROFIL EO</p>
                  <h2 className="mt-1.5 text-xl font-semibold text-text">Informasi organisasi</h2>
                </div>
                <button type="submit" className={buttonClasses({ size: 'sm' })} disabled={form.processing}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {form.processing ? 'Menyimpan…' : 'Simpan perubahan'}
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Nama tampilan" htmlFor="display_name" required className="sm:col-span-2">
                  <Input id="display_name" value={form.data.display_name} onChange={(event) => form.setData('display_name', event.target.value)} error={form.errors.display_name} />
                </Field>
                <Field label="Deskripsi" htmlFor="description" className="sm:col-span-2">
                  <Textarea id="description" rows={5} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} error={form.errors.description} />
                </Field>
                <Field label="Kategori" htmlFor="category">
                  <Select id="category" value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} error={form.errors.category}>
                    <option value="">Pilih kategori</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </Select>
                </Field>
                <Field label="Lokasi" htmlFor="location">
                  <CitySelect id="location" value={form.data.location} onChange={(event) => form.setData('location', event.target.value)} error={form.errors.location} />
                </Field>
                <Field label="Preferensi proposal" htmlFor="proposal_preference">
                  <Select id="proposal_preference" value={form.data.proposal_preference} onChange={(event) => form.setData('proposal_preference', event.target.value)} error={form.errors.proposal_preference}>
                    <option value="">Pilih preferensi</option>
                    <option value="open">Menerima semua proposal</option>
                    <option value="selective">Selektif</option>
                    <option value="closed">Tidak menerima proposal</option>
                  </Select>
                </Field>
              </div>
            </form>
          ) : <section className="rounded-[12px] border border-border bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-[0.06em] text-text-muted">EVENT ORGANIZER</p>
                <h1 className="mt-1.5 text-2xl font-semibold leading-tight text-text">{organization?.name ?? 'Belum diisi'}</h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary-strong">
                  {organization?.description ?? 'Profil ini masih kosong. Tambahkan deskripsi dan buat event untuk menampilkan potensi di platform.'}
                </p>
              </div>
              {(organization?.rating_average ?? null) !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-text">{organization.rating_average ?? '—'}</span>
                  <Star className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  <span className="text-xs tabular-nums text-text-secondary-strong">{organization.review_count ?? 0} ulasan</span>
                </div>
              ) : null}
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs text-text-muted">Lokasi</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization?.location ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Kategori</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization?.category ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Bentuk hukum</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{organization?.legal_form ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Preferensi proposal</dt>
                <dd className="mt-0.5 text-sm text-text-secondary-strong">{proposalPreferenceLabels[organization?.proposal_preference] ?? '—'}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              {active > 0 ? (
                <StatusBadge status={`approved-${active}`}>{active} verifikasi disetujui</StatusBadge>
              ) : null}
              {pending > 0 ? (
                <StatusBadge status="pending">{pending} permintaan sedang diproses</StatusBadge>
              ) : null}
              {active > 0 || pending > 0 ? null : (
                <StatusBadge status="neutral">Belum ada verifikasi</StatusBadge>
              )}
            </div>
          </section>}

          {eventsCount > 0 ? (
            <section className="mt-6 rounded-[12px] border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-text">Event yang dipublikasikan</h2>
                <span className="text-xs tabular-nums text-text-secondary-strong">{publishedEventsCount} terbit</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div key={event.id} className="rounded-[8px] border border-border bg-background-muted p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-xs font-medium text-text">{event.title}</h3>
                      <StatusBadge status="published" />
                    </div>
                    <p className="mt-1 text-xs text-text-secondary-strong">{event.location}</p>
                    <p className="mt-1 text-[11px] text-text-muted">{formatDateRange(event.date_start, event.date_end)}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Profil</h2>
            <dl className="mt-3 divide-y divide-border">
              <div className="flex items-start gap-3 py-3">
                <FileText className="mt-1 h-4 w-4 text-text-muted" aria-hidden="true" />
                <div>
                  <p className="text-xs text-text-muted">Deskripsi</p>
                  <p className="mt-1 text-sm text-text-secondary-strong">{organization?.description ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <MapPin className="mt-1 h-4 w-4 text-text-muted" aria-hidden="true" />
                <div>
                  <p className="text-xs text-text-muted">Lokasi</p>
                  <p className="mt-1 text-sm text-text-secondary-strong">{organization?.location ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <span className="h-4 w-4 text-text-muted" aria-hidden="true"></span>
                <div>
                  <p className="text-xs text-text-muted">Bentuk hukum</p>
                  <p className="mt-1 text-sm text-text-secondary-strong">{legalFormLabels[organization?.legal_form] ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <span className="h-4 w-4 text-text-muted" aria-hidden="true"></span>
                <div>
                  <p className="text-xs text-text-muted">Preferensi proposal</p>
                  <p className="mt-1 text-sm text-text-secondary-strong">{proposalPreferenceLabels[organization?.proposal_preference] ?? '—'}</p>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-[12px] border border-border bg-background-muted p-5">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary-strong" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text">Rating</h2>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-text">{averageRating ?? 'Belum ada ulasan'}</span>
              <Star className="h-4 w-4 text-text-muted" aria-hidden="true" />
            </div>
            <p className="mt-1 text-xs text-text-secondary-strong">{totalRatings ?? 0} ulasan dari sponsor</p>
          </div>

          {active > 0 ? (
            <div className="rounded-[12px] border border-border bg-background-muted p-5">
              <h2 className="text-sm font-semibold text-text">Verifikasi yang disetujui</h2>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                {active} of {verifications?.length ?? 0} pengajuan terverifikasi. Verifikasi adalah histori status usaha, bukan jaminan kelayakan.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </DashboardLayout>
  );
}
