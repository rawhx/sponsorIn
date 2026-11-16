import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, FileText, Rocket, Save, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button, { buttonClasses } from '../../components/Button';
import { Field, Input, Select, Textarea } from '../../components/Form';
import CitySelect from '../../components/CitySelect';

export default function ProposalForm({ events, selectedSponsor }) {
  const { data, setData, post, processing, errors } = useForm({
    event_id: events[0]?.id ?? '',
    sponsor_org_id: selectedSponsor?.id ?? '',
    title: '',
    event_type: '',
    location: '',
    event_date_start: '',
    event_date_end: '',
    event_time_start: '',
    event_time_end: '',
    timezone: 'WIB',
    estimated_attendees: '0',
    sales_potential: '0',
    description: '',
    proposal_file: null,
    package_id: '',
    requested_support: '',
    deliverables: '',
    terms_summary: '',
    valid_until: '',
    publish: true,
  });

  function submit(action = 'publish') {
    setData('publish', action === 'publish');
    post('/eo/proposals', { forceFormData: true, preserveScroll: true });
  }

  const noEvents = events.length === 0;
  const selectedEvent = events.find((event) => String(event.id) === String(data.event_id));
  const sponsorPreferenceLabel = selectedSponsor.proposal_preference === 'selective'
    ? 'Selektif menerima proposal'
    : 'Terbuka menerima proposal';

  return (
    <DashboardLayout
      eyebrow="Ruang Kerja EO"
      title="Formulir Pembuatan Proposal"
      description="Buat dan ajukan proposal resmi sponsorship ke brand mitra tujuan."
      actions={
        <Link href="/eo/sponsors/available" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Lihat Sponsor Tersedia
        </Link>
      }
    >
      <Head title="Formulir Pembuatan Proposal" />

      {noEvents ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <p className="text-base font-bold text-slate-900">Belum Ada Event yang Dipublikasikan</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 max-w-md mx-auto">
            Proposal hanya dapat dibuat untuk event yang sudah aktif dan terbit. Silakan publikasikan event terlebih dahulu.
          </p>
          <Link href="/eo/events" className={buttonClasses({ className: 'mt-5' })}>
            Kelola Event Saya
          </Link>
        </div>
      ) : (
        <form className="space-y-6">
          {/* Card 1: Data Event & Sponsor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              1. Rincian Event & Sasaran Sponsor
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-700">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Sponsor tujuan</p>
                  <p className="text-sm font-bold text-slate-900">{selectedSponsor.name}</p>
                  <p className="text-xs text-slate-600">
                    {[selectedSponsor.location, sponsorPreferenceLabel].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
              <Link href="/eo/sponsors/available" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
                Ganti sponsor
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Judul Proposal" htmlFor="title" required error={errors.title}>
                <Input id="title" value={data.title} onChange={(event) => setData('title', event.target.value)} placeholder="Contoh: Proposal Kemitraan Festival Budaya 2026..." />
              </Field>

              <Field label="Jenis Kegiatan" htmlFor="event_type" error={errors.event_type}>
                <Select id="event_type" value={data.event_type} onChange={(event) => setData('event_type', event.target.value)}>
                  <option value="">-- Pilih Jenis Kegiatan --</option>
                  <option value="Konser">Konser</option>
                  <option value="Festival">Festival</option>
                  <option value="Expo">Expo</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Lainnya">Lainnya</option>
                </Select>
              </Field>

              <Field label="Pilih Event Terkait" htmlFor="event_id" required error={errors.event_id}>
                <Select id="event_id" value={data.event_id} onChange={(event) => { setData('event_id', event.target.value); setData('package_id', ''); }}>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Estimasi Peserta / Pengunjung" htmlFor="estimated_attendees" error={errors.estimated_attendees} hint="Default 0">
                <Input id="estimated_attendees" type="number" min="0" value={data.estimated_attendees} onChange={(event) => setData('estimated_attendees', event.target.value)} />
              </Field>

              <Field label="Potensi Penjualan Selama Event (Rp)" htmlFor="sales_potential" error={errors.sales_potential} hint="Default 0">
                <Input id="sales_potential" type="number" min="0" step="1000" value={data.sales_potential} onChange={(event) => setData('sales_potential', event.target.value)} />
              </Field>

              <Field label="Lokasi / Venue" htmlFor="location" required error={errors.location}>
                <CitySelect id="location" value={data.location} onChange={(event) => setData('location', event.target.value)} error={errors.location} placeholder="Cari kota atau ketik nama tempat..." />
              </Field>

              <Field label="Tanggal Kegiatan Dimulai" htmlFor="event_date_start" required error={errors.event_date_start}>
                <Input id="event_date_start" type="date" value={data.event_date_start} onChange={(event) => setData('event_date_start', event.target.value)} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Waktu Mulai" htmlFor="event_time_start" error={errors.event_time_start}>
                  <Input id="event_time_start" type="time" value={data.event_time_start} onChange={(event) => setData('event_time_start', event.target.value)} />
                </Field>
                <Field label="Waktu Selesai" htmlFor="event_time_end" error={errors.event_time_end}>
                  <Input id="event_time_end" type="time" value={data.event_time_end} onChange={(event) => setData('event_time_end', event.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Zona Waktu" htmlFor="timezone" error={errors.timezone}>
                  <Select id="timezone" value={data.timezone} onChange={(event) => setData('timezone', event.target.value)}>
                    <option value="WIB">WIB</option>
                    <option value="WITA">WITA</option>
                    <option value="WIT">WIT</option>
                  </Select>
                </Field>
                <Field label="Paket Tertentu (Opsional)" htmlFor="package_id" error={errors.package_id}>
                  <Select id="package_id" value={data.package_id} onChange={(event) => setData('package_id', event.target.value)}>
                    <option value="">Tanpa paket khusus</option>
                    {selectedEvent?.packages?.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          </div>

          {/* Card 2: Permintaan & Deliverables */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              2. Bentuk Dukungan & Timbal Balik
            </h2>

            <Field label="Deskripsi Lengkap Proposal" htmlFor="description" error={errors.description}>
              <Textarea id="description" rows={4} value={data.description} onChange={(event) => setData('description', event.target.value)} placeholder="Jelaskan gambaran umum acara, keunikan, dan target audiens secara jelas..." />
            </Field>

            <Field label="Bentuk Dukungan yang Diminta" htmlFor="requested_support" required error={errors.requested_support}>
              <Textarea id="requested_support" rows={3} value={data.requested_support} onChange={(event) => setData('requested_support', event.target.value)} placeholder="Misal: Dana tunai sponsorship Rp 25.000.000 atau dukungan produk senilai nominal tersebut..." />
            </Field>

            <Field label="Deliverable untuk Sponsor (Hak Timbal Balik)" htmlFor="deliverables" error={errors.deliverables}>
              <Textarea id="deliverables" rows={3} value={data.deliverables} onChange={(event) => setData('deliverables', event.target.value)} placeholder="Misal: Pemasangan logo di materi promo, slot stan 3x3m, penyebutan brand oleh MC..." />
            </Field>

            <Field label="Ringkasan Ketentuan Khusus" htmlFor="terms_summary" error={errors.terms_summary}>
              <Textarea id="terms_summary" rows={3} value={data.terms_summary} onChange={(event) => setData('terms_summary', event.target.value)} placeholder="Klausul eksklusivitas kategori, termin pembayaran, atau syarat pembatalan bila ada..." />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Batas Masa Berlaku Penawaran" htmlFor="valid_until" error={errors.valid_until} hint="Opsional">
                <Input id="valid_until" type="date" value={data.valid_until} onChange={(event) => setData('valid_until', event.target.value)} />
              </Field>

              <Field label="Lampiran Dokumen Proposal (PDF)" htmlFor="proposal_file" error={errors.proposal_file} hint="Maksimal 5MB">
                <label className="flex h-10 sm:h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-600 transition-colors hover:border-emerald-600 hover:text-emerald-700">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>{data.proposal_file ? data.proposal_file.name : 'Pilih Berkas PDF'}</span>
                  <input id="proposal_file" type="file" accept="application/pdf" className="hidden" onChange={(event) => setData('proposal_file', event.target.files?.[0] ?? null)} />
                </label>
              </Field>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <Link href="/eo/proposals" className={buttonClasses({ variant: 'outline', size: 'md' })}>
              <ArrowLeft className="h-4 w-4" />
              Batal
            </Link>
            <Button type="button" variant="outline" size="md" onClick={() => submit('draft')} disabled={processing}>
              <Save className="h-4 w-4" />
              Simpan sebagai Draf
            </Button>
            <Button type="button" size="md" onClick={() => submit('publish')} disabled={processing}>
              <Rocket className="h-4 w-4" aria-hidden="true" />
              {processing ? 'Memproses…' : 'Kirim Proposal Resmi'}
            </Button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
