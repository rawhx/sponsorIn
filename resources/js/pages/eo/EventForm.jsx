import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button, { buttonClasses } from '../../components/Button';
import { Field, Input, Select, Textarea } from '../../components/Form';
import CitySelect from '../../components/CitySelect';

export default function EoEventForm({ event, categories = [], formats = [] }) {
  const isEdit = Boolean(event);
  const categoryOptions = event?.category && !categories.includes(event.category)
    ? [event.category, ...categories]
    : categories;
  const normalizedFormat = event?.format
    ? formats.find((format) => format.toLowerCase() === event.format.toLowerCase()) ?? event.format
    : (formats[0] ?? 'Offline');
  const formatOptions = normalizedFormat && !formats.includes(normalizedFormat)
    ? [normalizedFormat, ...formats]
    : formats;

  const { data, setData, post, put, processing, errors } = useForm({
    title: event?.title ?? '',
    category: event?.category ?? '',
    format: normalizedFormat,
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
    <DashboardLayout
      eyebrow="Ruang Kerja EO"
      title={isEdit ? 'Ubah Rincian Event' : 'Buat Event Baru'}
      description="Lengkapi informasi umum event sebelum menambahkan bukti audiens dan paket sponsorship."
    >
      <Head title={isEdit ? 'Ubah Event' : 'Buat Event Baru'} />

      <Link href="/eo/events" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar event
      </Link>

      <form onSubmit={submit} className="space-y-6">
        {/* Basic Info */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="rounded-t-2xl border-b border-slate-100 bg-slate-50/70 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">1. Informasi Dasar Event</h2>
            <p className="mt-0.5 text-xs text-slate-500">Judul, kategori, format, dan jadwal pelaksanaan event.</p>
          </div>
          <div className="space-y-5 p-6">
            <Field label="Judul Event" htmlFor="title" error={errors.title} required>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                error={errors.title}
                maxLength={160}
                placeholder="Contoh: Festival Musik Pemuda Nusantara 2026..."
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Kategori" htmlFor="category" error={errors.category} required>
                <Select id="category" value={data.category} onChange={(event) => setData('category', event.target.value)} error={errors.category}>
                  <option value="">Pilih kategori event</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Format Pelaksanaan" htmlFor="format" error={errors.format} required>
                <Select id="format" value={data.format} onChange={(event) => setData('format', event.target.value)} error={errors.format}>
                  {formatOptions.map((format) => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Tanggal Mulai" htmlFor="date_start" error={errors.date_start} required>
                <Input id="date_start" type="date" value={data.date_start} onChange={(e) => setData('date_start', e.target.value)} error={errors.date_start} />
              </Field>
              <Field label="Tanggal Selesai" htmlFor="date_end" error={errors.date_end} hint="Opsional">
                <Input id="date_end" type="date" value={data.date_end} onChange={(e) => setData('date_end', e.target.value)} error={errors.date_end} />
              </Field>
            </div>

            <Field label="Lokasi / Kota Pelaksanaan" htmlFor="location" error={errors.location} required>
              <CitySelect
                id="location"
                value={data.location}
                onChange={(event) => setData('location', event.target.value)}
                error={errors.location}
                placeholder="Cari kota atau ketik venue spesifik..."
              />
            </Field>
          </div>
        </section>

        {/* Description & Audience */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="rounded-t-2xl border-b border-slate-100 bg-slate-50/70 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">2. Deskripsi & Profil Penonton</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Jelaskan konsep acara dan segmentasi demografi target pengunjung.
            </p>
          </div>
          <div className="space-y-5 p-6">
            <Field label="Deskripsi Lengkap Event" htmlFor="description" error={errors.description} required>
              <Textarea
                id="description"
                rows={5}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                error={errors.description}
                placeholder="Ceritakan latar belakang, tujuan acara, dan rangkaian kegiatan..."
              />
            </Field>

            <Field label="Profil Demografi Audiens" htmlFor="audience_profile" error={errors.audience_profile} hint="Opsional">
              <Textarea
                id="audience_profile"
                rows={3}
                value={data.audience_profile}
                onChange={(e) => setData('audience_profile', e.target.value)}
                error={errors.audience_profile}
                placeholder="Rentang usia, minat utama, domisili, atau karakteristik penonton..."
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Estimasi Kapasitas Pengunjung" htmlFor="capacity_estimate" error={errors.capacity_estimate} hint="Perkiraan orang">
                <Input
                  id="capacity_estimate"
                  type="number"
                  min="1"
                  value={data.capacity_estimate}
                  onChange={(e) => setData('capacity_estimate', e.target.value)}
                  error={errors.capacity_estimate}
                  placeholder="Mis. 5000"
                />
              </Field>
            </div>

            <Field label="Kebutuhan Dukungan Sponsorship" htmlFor="support_needs" error={errors.support_needs} hint="Opsional">
              <Textarea
                id="support_needs"
                rows={3}
                value={data.support_needs}
                onChange={(e) => setData('support_needs', e.target.value)}
                error={errors.support_needs}
                placeholder="Contoh: Dana produksi panggung, sponsorship produk konsumsi, media partner..."
              />
            </Field>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/eo/events"
            className={buttonClasses({ variant: 'outline', size: 'md' })}
          >
            Batal
          </Link>
          <Button type="submit" disabled={processing} size="md">
            <Save className="h-4 w-4" />
            {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan sebagai Draf'}
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-slate-500">
          💡 <strong>Tahap Berikutnya:</strong> Setelah tersimpan sebagai draf, Anda dapat menambahkan rincian berkas bukti audiens dan paket sponsorship di halaman detail event sebelum mengajukannya untuk moderasi.
        </p>
      </form>
    </DashboardLayout>
  );
}
