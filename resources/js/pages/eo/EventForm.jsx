import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import { Field, Input, Textarea } from '../../components/Form';

export default function EoEventForm({ event }) {
  const isEdit = Boolean(event);

  const { data, setData, post, put, processing, errors } = useForm({
    title: event?.title ?? '',
    category: event?.category ?? '',
    format: event?.format ?? 'Offline',
    date_start: event?.date_start ?? '',
    date_end: event?.date_end ?? '',
    location: event?.location ?? '',
    description: event?.description ?? '',
    audience_profile: event?.audience_profile ?? '',
    capacity_estimate: event?.capacity_estimate ?? '',
    support_needs: event?.support_needs ?? '',
  });

  function submit(formEvent) {
    formEvent.preventDefault();
    if (isEdit) {
      put(`/eo/events/${event.id}`);
    } else {
      post('/eo/events');
    }
  }

  return (
    <DashboardLayout eyebrow="Ruang kerja EO" title={isEdit ? 'Ubah event' : 'Event baru'}>
      <Head title={isEdit ? 'Ubah event' : 'Event baru'} />

      <Link href="/eo/events" className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary-strong hover:text-text">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar event
      </Link>

      <form onSubmit={submit} className="max-w-3xl space-y-6">
        <section className="rounded-[12px] border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-text">Informasi dasar</h2>
            <p className="mt-1 text-xs text-text-secondary-strong">Judul, kategori, dan jadwal event yang tampil pada daftar peluang.</p>
          </div>
          <div className="space-y-5 px-5 py-5">
            <Field label="Judul event" htmlFor="title" error={errors.title} required>
              <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} maxLength={160} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Kategori" htmlFor="category" error={errors.category} required hint="Mis. Musik, Teknologi, Kuliner">
                <Input id="category" value={data.category} onChange={(e) => setData('category', e.target.value)} error={errors.category} maxLength={80} />
              </Field>
              <Field label="Format" htmlFor="format" error={errors.format} required>
                <Input id="format" value={data.format} onChange={(e) => setData('format', e.target.value)} error={errors.format} maxLength={40} placeholder="Offline / Online / Hybrid" />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Tanggal mulai" htmlFor="date_start" error={errors.date_start} required>
                <Input id="date_start" type="date" value={data.date_start} onChange={(e) => setData('date_start', e.target.value)} error={errors.date_start} />
              </Field>
              <Field label="Tanggal selesai" htmlFor="date_end" error={errors.date_end} hint="Opsional">
                <Input id="date_end" type="date" value={data.date_end} onChange={(e) => setData('date_end', e.target.value)} error={errors.date_end} />
              </Field>
            </div>
            <Field label="Lokasi" htmlFor="location" error={errors.location} required>
              <Input id="location" value={data.location} onChange={(e) => setData('location', e.target.value)} error={errors.location} maxLength={160} placeholder="Kota atau venue" />
            </Field>
          </div>
        </section>

        <section className="rounded-[12px] border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-text">Deskripsi dan audiens</h2>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
              Jelaskan event dan profil audiens. Anda akan menambahkan angka beserta sumbernya pada langkah berikutnya.
            </p>
          </div>
          <div className="space-y-5 px-5 py-5">
            <Field label="Deskripsi event" htmlFor="description" error={errors.description} required>
              <Textarea id="description" rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} error={errors.description} />
            </Field>
            <Field label="Profil audiens" htmlFor="audience_profile" error={errors.audience_profile} hint="Opsional">
              <Textarea id="audience_profile" rows={3} value={data.audience_profile} onChange={(e) => setData('audience_profile', e.target.value)} error={errors.audience_profile} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Estimasi kapasitas" htmlFor="capacity_estimate" error={errors.capacity_estimate} hint="Jumlah orang">
                <Input id="capacity_estimate" type="number" min="1" value={data.capacity_estimate} onChange={(e) => setData('capacity_estimate', e.target.value)} error={errors.capacity_estimate} />
              </Field>
            </div>
            <Field label="Kebutuhan dukungan" htmlFor="support_needs" error={errors.support_needs} hint="Opsional">
              <Textarea id="support_needs" rows={3} value={data.support_needs} onChange={(e) => setData('support_needs', e.target.value)} error={errors.support_needs} placeholder="Mis. dana produksi panggung, sponsor produk minuman" />
            </Field>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Link href="/eo/events" className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border px-4 text-sm font-medium text-text hover:bg-hover">
            Batal
          </Link>
          <Button type="submit" disabled={processing}>
            {processing ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan sebagai draft'}
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-text-muted">
          Setelah tersimpan sebagai draft, tambahkan bukti audiens dan paket sponsorship sebelum mengirim untuk review.
        </p>
      </form>
    </DashboardLayout>
  );
}
