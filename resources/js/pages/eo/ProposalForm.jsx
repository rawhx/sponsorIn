import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, FileText, Rocket } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import { Field, Input, Select, Textarea } from '../../components/Form';

export default function ProposalForm({ events, sponsors, selectedSponsor }) {
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
  const noSponsors = sponsors.length === 0;
  const selected = sponsors.find((sponsor) => String(sponsor.id) === String(data.sponsor_org_id));

  return (
    <DashboardLayout
      eyebrow="Kolaborasi"
      title="Formulir Pembuatan Proposal"
      actions={
        <Link href="/eo/sponsors/available" className="inline-flex items-center gap-2 text-sm text-text-secondary-strong transition-colors hover:text-text">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Sponsor tersedia
        </Link>
      }
    >
      <Head title="Formulir Pembuatan Proposal" />

      {noEvents ? (
        <div className="rounded-[12px] border border-border bg-background-muted p-6">
          <p className="text-sm font-medium text-text">Belum ada event terbit</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary-strong">
            Proposal hanya bisa dibuat untuk event yang sudah tayang. Publikasikan event terlebih dahulu.
          </p>
          <Link href="/eo/events" className="mt-4 inline-block text-sm font-medium text-primary-strong hover:underline">
            Kelola event saya
          </Link>
        </div>
      ) : noSponsors ? (
        <div className="rounded-[12px] border border-border bg-background-muted p-6">
          <p className="text-sm font-medium text-text">Belum ada sponsor yang bisa dihubungi</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary-strong">
            Sponsor yang muncul di sini sudah terverifikasi dan membuka diri untuk menerima proposal.
          </p>
        </div>
      ) : (
        <form className="space-y-6">
          <div className="grid gap-5 rounded-[12px] border border-border bg-surface p-5 md:grid-cols-2">
            <Field label="Judul Proposal" htmlFor="title" required error={errors.title}>
              <Input id="title" value={data.title} onChange={(event) => setData('title', event.target.value)} placeholder="Contoh: Konser Musik Senja 2024" />
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

            <Field label="Event" htmlFor="event_id" required error={errors.event_id}>
              <Select id="event_id" value={data.event_id} onChange={(event) => { setData('event_id', event.target.value); setData('package_id', ''); }}>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </Select>
            </Field>

            <Field label="Sponsor Tujuan" htmlFor="sponsor_org_id" required error={errors.sponsor_org_id}>
              <Select id="sponsor_org_id" value={data.sponsor_org_id} onChange={(event) => setData('sponsor_org_id', event.target.value)}>
                <option value="">Pilih sponsor…</option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>{sponsor.name}{sponsor.location ? ` · ${sponsor.location}` : ''}</option>
                ))}
              </Select>
            </Field>

            <Field label="Estimasi Peserta" htmlFor="estimated_attendees" error={errors.estimated_attendees} hint="Default 0">
              <Input id="estimated_attendees" type="number" min="0" value={data.estimated_attendees} onChange={(event) => setData('estimated_attendees', event.target.value)} />
            </Field>

            <Field label="Potensi Penjualan Selama Event" htmlFor="sales_potential" error={errors.sales_potential} hint="Default 0">
              <Input id="sales_potential" type="number" min="0" step="1000" value={data.sales_potential} onChange={(event) => setData('sales_potential', event.target.value)} />
            </Field>

            <Field label="Lokasi" htmlFor="location" required error={errors.location}>
              <Input id="location" value={data.location} onChange={(event) => setData('location', event.target.value)} placeholder="Nama Tempat / Kota" />
            </Field>

            <Field label="Tanggal Kegiatan" htmlFor="event_date_start" required error={errors.event_date_start}>
              <Input id="event_date_start" type="date" value={data.event_date_start} onChange={(event) => setData('event_date_start', event.target.value)} />
            </Field>

            <Field label="Waktu Mulai" htmlFor="event_time_start" error={errors.event_time_start} hint="--:--">
              <Input id="event_time_start" type="time" value={data.event_time_start} onChange={(event) => setData('event_time_start', event.target.value)} />
            </Field>

            <Field label="Waktu Selesai" htmlFor="event_time_end" error={errors.event_time_end} hint="--:--">
              <Input id="event_time_end" type="time" value={data.event_time_end} onChange={(event) => setData('event_time_end', event.target.value)} />
            </Field>

            <Field label="Zona Waktu" htmlFor="timezone" error={errors.timezone}>
              <Select id="timezone" value={data.timezone} onChange={(event) => setData('timezone', event.target.value)}>
                <option value="WIB">WIB</option>
                <option value="WITA">WITA</option>
                <option value="WIT">WIT</option>
              </Select>
            </Field>

            <Field label="Paket (opsional)" htmlFor="package_id" error={errors.package_id} hint={selected?.packages?.length ? undefined : 'Event ini belum punya paket'}>
              <Select id="package_id" value={data.package_id} onChange={(event) => setData('package_id', event.target.value)} disabled={!selected?.packages?.length}>
                <option value="">Tanpa paket tertentu</option>
                {selected?.packages?.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="rounded-[12px] border border-border bg-surface p-5 space-y-5">
            <Field label="Deskripsi Lengkap Event" htmlFor="description" error={errors.description}>
              <Textarea id="description" rows={6} value={data.description} onChange={(event) => setData('description', event.target.value)} placeholder="Jelaskan detail acara, target audiens, dan nilai jual event Anda..." />
            </Field>

            <Field label="Dukungan yang diminta" htmlFor="requested_support" required error={errors.requested_support}>
              <Textarea id="requested_support" rows={4} value={data.requested_support} onChange={(event) => setData('requested_support', event.target.value)} placeholder="Jelaskan bentuk dukungan yang Anda butuhkan secara konkret." />
            </Field>

            <Field label="Deliverable untuk sponsor" htmlFor="deliverables" error={errors.deliverables}>
              <Textarea id="deliverables" rows={4} value={data.deliverables} onChange={(event) => setData('deliverables', event.target.value)} placeholder="Apa yang akan sponsor dapatkan di event Anda." />
            </Field>

            <Field label="Ringkasan ketentuan" htmlFor="terms_summary" error={errors.terms_summary}>
              <Textarea id="terms_summary" rows={3} value={data.terms_summary} onChange={(event) => setData('terms_summary', event.target.value)} placeholder="Catatan timeline, eksklusivitas, atau syarat lain bila ada." />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Berlaku sampai" htmlFor="valid_until" error={errors.valid_until} hint="Opsional">
                <Input id="valid_until" type="date" value={data.valid_until} onChange={(event) => setData('valid_until', event.target.value)} />
              </Field>

              <Field label="File Proposal (PDF)" htmlFor="proposal_file" error={errors.proposal_file} hint="Maksimal 5MB">
                <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-dashed border-border bg-background-muted px-3 text-sm font-medium text-text-secondary-strong transition-colors hover:border-primary-strong hover:text-primary-strong">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>Pilih File</span>
                  <input id="proposal_file" type="file" accept="application/pdf" className="hidden" onChange={(event) => setData('proposal_file', event.target.files?.[0] ?? null)} />
                </label>
                {data.proposal_file ? <p className="mt-2 text-xs text-text-secondary-strong">{data.proposal_file.name}</p> : null}
              </Field>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
            <Link href="/eo/proposals" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary-strong hover:text-text">
              <span aria-hidden="true">←</span>
              Batal
            </Link>
            <Button type="button" variant="outline" onClick={() => submit('draft')} disabled={processing}>
              Simpan Draft
            </Button>
            <Button type="button" onClick={() => submit('publish')} disabled={processing}>
              <Rocket className="h-4 w-4" aria-hidden="true" />
              {processing ? 'Memproses…' : 'Publish'}
            </Button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
