import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Edit3, Save, Star, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import { Field, Input, Select, Textarea } from '../../components/Form';
import CitySelect from '../../components/CitySelect';
import { formatDateRange, proposalPreferenceLabels } from '../../lib/utils';

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
      eyebrow="Profil Organisasi EO"
      title="Profil Publik Penyelenggara"
      description="Kelola informasi yang dapat dilihat oleh calon brand sponsor pada direktori publik."
      actions={
        <div className="flex flex-wrap gap-2">
          {!editing ? (
            <button type="button" onClick={startEditing} className={buttonClasses({ variant: 'outline', size: 'sm' })}>
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit Profil
            </button>
          ) : (
            <button type="button" onClick={cancelEditing} className={buttonClasses({ variant: 'outline', size: 'sm' })}>
              <X className="h-4 w-4" aria-hidden="true" />
              Batal
            </button>
          )}
        </div>
      }
    >
      <Head title="Profil Publik EO" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div>
          {editing ? (
            <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                <div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Mode Pengubahan Profil</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">Perbarui Data Organisasi</h2>
                </div>
                <Button type="submit" size="sm" disabled={form.processing}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {form.processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                </Button>
              </div>
              <div className="space-y-4">
                <Field label="Nama Organisasi / Tampilan" htmlFor="display_name" required>
                  <Input id="display_name" value={form.data.display_name} onChange={(event) => form.setData('display_name', event.target.value)} error={form.errors.display_name} />
                </Field>
                <Field label="Deskripsi Profil Organisasi" htmlFor="description">
                  <Textarea id="description" rows={5} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} error={form.errors.description} placeholder="Ceritakan fokus bidang, sejarah komunitas, atau jenis event spesialisasi Anda..." />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kategori Utama" htmlFor="category">
                    <Select id="category" value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} error={form.errors.category}>
                      <option value="">Pilih kategori</option>
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </Select>
                  </Field>
                  <Field label="Lokasi Domisili" htmlFor="location">
                    <CitySelect id="location" value={form.data.location} onChange={(event) => form.setData('location', event.target.value)} error={form.errors.location} />
                  </Field>
                </div>
                <Field label="Preferensi Penerimaan Proposal" htmlFor="proposal_preference">
                  <Select id="proposal_preference" value={form.data.proposal_preference} onChange={(event) => form.setData('proposal_preference', event.target.value)} error={form.errors.proposal_preference}>
                    <option value="">Pilih preferensi</option>
                    <option value="open">Menerima semua proposal</option>
                    <option value="selective">Selektif</option>
                    <option value="closed">Tidak menerima proposal</option>
                  </Select>
                </Field>
              </div>
            </form>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
                    Penyelenggara Event
                  </span>
                  <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900">{organization?.name ?? 'Belum diisi'}</h1>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    {organization?.description ?? 'Profil ini masih kosong. Tambahkan deskripsi agar calon mitra sponsor mengenal rekam jejak Anda.'}
                  </p>
                </div>
                {(organization?.rating_average ?? null) !== null ? (
                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden="true" />
                    <span className="text-base font-bold text-slate-900">{Number(organization.rating_average).toFixed(1)}</span>
                    <span className="text-xs text-slate-400 font-medium">({organization.review_count ?? 0} ulasan)</span>
                  </div>
                ) : null}
              </div>

              <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lokasi Domisili</dt>
                  <dd className="mt-1 font-medium text-slate-800">{organization?.location ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori Spesialisasi</dt>
                  <dd className="mt-1 font-medium text-slate-800">{organization?.category ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bentuk Badan Usaha</dt>
                  <dd className="mt-1 font-medium text-slate-800">{organization?.legal_form ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preferensi Penerimaan</dt>
                  <dd className="mt-1 font-medium text-slate-800">{proposalPreferenceLabels[organization?.proposal_preference] ?? '—'}</dd>
                </div>
              </dl>
            </section>
          )}

          {eventsCount > 0 ? (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Event yang Dipublikasikan</h2>
                <span className="text-xs font-semibold text-emerald-700">{publishedEventsCount} Terbit</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div key={event.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-bold text-slate-900">{event.title}</h3>
                      <StatusBadge status="published" />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{event.location}</p>
                    <p className="mt-1 text-xs tabular-nums text-slate-400">{formatDateRange(event.date_start, event.date_end)}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Aside */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-900">Rating & Reputasi</h2>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{averageRating ?? '—'}</span>
              <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{totalRatings ?? 0} ulasan dari brand sponsor mitra</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Status Validasi Profil</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Profil Anda aktif dan dapat ditemukan oleh brand sponsor di direktori publik platform SponsorIn.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
