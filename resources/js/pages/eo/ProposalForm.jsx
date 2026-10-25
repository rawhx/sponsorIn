import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, Info } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import { Field, Input, Select, Textarea } from '../../components/Form';
import { EvidenceTag } from '../../components/StatusBadge';

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

function preferenceBadge(preference) {
  return (
    <EvidenceTag tone={preferenceTones[preference] ?? 'neutral'}>
      {preferenceLabels[preference] ?? preference}
    </EvidenceTag>
  );
}

export default function ProposalForm({ events, sponsors, selectedSponsor }) {
  const { data, setData, post, processing, errors } = useForm({
    event_id: events[0]?.id ?? '',
    sponsor_org_id: selectedSponsor?.id ?? '',
    package_id: '',
    requested_support: '',
    deliverables: '',
    terms_summary: '',
    valid_until: '',
  });

  function sponsorChanged(value) {
    setData('event_id', events[0]?.id ?? '');
    setData('sponsor_org_id', value);
    setData('package_id', '');
    setData('requested_support', '');
    setData('deliverables', '');
    setData('terms_summary', '');
    setData('valid_until', '');
  }

  function submit(event) {
    event.preventDefault();
    post('/eo/proposals');
  }

  const noEvents = events.length === 0;
  const noSponsors = sponsors.length === 0;
  const selected = sponsors.find((sponsor) => String(sponsor.id) === String(data.sponsor_org_id));

  return (
    <DashboardLayout
      eyebrow="Kolaborasi"
      title="Buat proposal"
      actions={
        <Link href="/sponsors/available" className="inline-flex items-center gap-2 text-sm text-text-secondary-strong transition-colors hover:text-text">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Sponsor tersedia
        </Link>
      }
    >
      <Head title="Buat proposal" />

      {noEvents ? (
        <div className="rounded-[12px] border border-border bg-background-muted p-6">
          <p className="text-sm font-medium text-text">Belum ada event terbit</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary-strong">
            Proposal hanya bisa dibuat untuk event yang sudah tayang. Publikasikan event terlebih dahulu melalui moderasi.
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
        <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <div className="min-w-0 space-y-6">
            <div className="space-y-5 rounded-[12px] border border-border bg-surface p-5">
              <Field label="Event" htmlFor="event_id" required error={errors.event_id}>
                <Select id="event_id" value={data.event_id} onChange={(event) => { setData('event_id', event.target.value); setData('package_id', ''); }}>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Sponsor tujuan" htmlFor="sponsor_org_id" required error={errors.sponsor_org_id}>
                <Select id="sponsor_org_id" value={data.sponsor_org_id} onChange={(event) => setData('sponsor_org_id', event.target.value)}>
                  <option value="">Pilih sponsor…</option>
                  {sponsors.map((sponsor) => (
                    <option key={sponsor.id} value={sponsor.id}>
                      {sponsor.name}{sponsor.location ? ` · ${sponsor.location}` : ''}
                    </option>
                  ))}
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

            <div className="space-y-5 rounded-[12px] border border-border bg-surface p-5">
              <Field label="Dukungan yang diminta" htmlFor="requested_support" required error={errors.requested_support}>
                <Textarea id="requested_support" rows={4} value={data.requested_support} onChange={(event) => setData('requested_support', event.target.value)} placeholder="Jelaskan bentuk dukungan yang Anda butuhkan secara konkret." />
              </Field>

              <Field label="Deliverable untuk sponsor" htmlFor="deliverables" error={errors.deliverables}>
                <Textarea id="deliverables" rows={4} value={data.deliverables} onChange={(event) => setData('deliverables', event.target.value)} placeholder="Apa yang akan sponsor dapatkan: penempatan logo, booth, sesi panggung, dan lainnya." />
              </Field>

              <Field label="Ringkasan ketentuan" htmlFor="terms_summary" error={errors.terms_summary}>
                <Textarea id="terms_summary" rows={3} value={data.terms_summary} onChange={(event) => setData('terms_summary', event.target.value)} placeholder="Catatan timeline, eksklusivitas, atau syarat lain bila ada." />
              </Field>

              <Field label="Berlaku sampai" htmlFor="valid_until" error={errors.valid_until} hint="Opsional">
                <Input id="valid_until" type="date" value={data.valid_until} onChange={(event) => setData('valid_until', event.target.value)} />
              </Field>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[12px] border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-text">Sebelum mengirim</h2>
              <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-text-secondary-strong">
                <li className="flex gap-2">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
                  Proposal yang terkirim membuka ruang percakapan dengan sponsor.
                </li>
                <li className="flex gap-2">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
                  Dukungan yang jelas dan deliverable yang terukur mempercepat keputusan.
                </li>
                <li className="flex gap-2">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
                  Anda bisa menarik proposal selama belum masuk negosiasi final.
                </li>
              </ul>
              <Button type="submit" className="mt-5 w-full" disabled={processing}>
                {processing ? 'Mengirim…' : 'Kirim proposal'}
              </Button>
            </div>
          </aside>
        </form>
      )}
    </DashboardLayout>
  );
}
