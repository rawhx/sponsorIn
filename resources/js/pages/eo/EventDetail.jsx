import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, CalendarDays, MapPin, Pencil, Plus, Send, Trash2, XCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge, { EvidenceTag } from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, Input, Select, Textarea } from '../../components/Form';
import { cn, evidenceTypeLabels, formatCurrency, formatDateRange, formatNumber, supportTypeLabels } from '../../lib/utils';

const availabilityOptions = [
  { value: 'available', label: 'Tersedia' },
  { value: 'limited', label: 'Terbatas' },
  { value: 'closed', label: 'Ditutup' },
];

function emptyEvidence() {
  return { evidence_type: 'projection', value: '', unit: 'orang', period: '', source_description: '', evidence_note: '' };
}

function EvidenceForm({ event, evidenceTypes, onDone }) {
  const initial = evidence
    ? {
        evidence_type: evidence.type,
        value: evidence.value,
        unit: evidence.unit,
        period: evidence.period,
        source_description: evidence.source,
        evidence_note: evidence.note ?? '',
      }
    : emptyEvidence();
  const { data, setData, post, put, processing, errors, reset } = useForm(initial);

  function submit(submitEvent) {
    submitEvent.preventDefault();
    const options = { preserveScroll: true, onSuccess: () => { reset(); onDone?.(); } };
    if (evidence) {
      put(`/eo/events/${event.id}/evidence/${evidence.id}`, options);
    } else {
      post(`/eo/events/${event.id}/evidence`, options);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-[12px] border border-border bg-background-muted p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Jenis bukti" htmlFor="evidence_type" error={errors.evidence_type} required>
          <Select id="evidence_type" value={data.evidence_type} onChange={(e) => setData('evidence_type', e.target.value)}>
            {evidenceTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Nilai" htmlFor="value" error={errors.value} required>
          <Input id="value" type="number" min="0" value={data.value} onChange={(e) => setData('value', e.target.value)} error={errors.value} />
        </Field>
        <Field label="Satuan" htmlFor="unit" error={errors.unit} required>
          <Input id="unit" value={data.unit} onChange={(e) => setData('unit', e.target.value)} error={errors.unit} placeholder="orang / klik" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Periode" htmlFor="period" error={errors.period} required hint="Mis. Jan–Mar 2026">
          <Input id="period" value={data.period} onChange={(e) => setData('period', e.target.value)} error={errors.period} />
        </Field>
        <Field label="Sumber data" htmlFor="source_description" error={errors.source_description} required hint="Wajib jelas">
          <Input id="source_description" value={data.source_description} onChange={(e) => setData('source_description', e.target.value)} error={errors.source_description} placeholder="Mis. laporan penjualan tiket internal" />
        </Field>
      </div>
      <Field label="Catatan" htmlFor="evidence_note" error={errors.evidence_note} hint="Opsional">
        <Input id="evidence_note" value={data.evidence_note} onChange={(e) => setData('evidence_note', e.target.value)} error={errors.evidence_note} />
      </Field>
      <div className="flex justify-end gap-2">
        {evidence ? (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>Batal</Button>
        ) : null}
        <Button type="submit" size="sm" disabled={processing}>{processing ? 'Menyimpan…' : evidence ? 'Simpan bukti' : 'Tambah bukti'}</Button>
      </div>
    </form>
  );
}

function PackageForm({ event, supportTypes, pkg, onDone }) {
  const initial = pkg
    ? {
        name: pkg.name,
        support_type: pkg.support_type,
        price_amount: pkg.price_amount ?? '',
        currency: pkg.currency ?? 'IDR',
        benefits: (pkg.benefits ?? []).join('\n'),
        deliverables: (pkg.deliverables ?? []).join('\n'),
        availability_status: pkg.availability_status,
        notes: pkg.notes ?? '',
      }
    : { name: '', support_type: 'cash', price_amount: '', currency: 'IDR', benefits: '', deliverables: '', availability_status: 'available', notes: '' };

  const { data, setData, post, put, processing, errors } = useForm(initial);

  function submit(submitEvent) {
    submitEvent.preventDefault();
    const payload = {
      ...data,
      benefits: data.benefits.split('\n').map((line) => line.trim()).filter(Boolean),
      deliverables: data.deliverables.split('\n').map((line) => line.trim()).filter(Boolean),
    };
    const options = { preserveScroll: true, onSuccess: () => onDone?.() };
    if (pkg) {
      put(`/eo/events/${event.id}/packages/${pkg.id}`, { ...options, data: payload });
    } else {
      post(`/eo/events/${event.id}/packages`, payload, options);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-[12px] border border-border bg-background-muted p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama paket" htmlFor="name" error={errors.name} required>
          <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} placeholder="Mis. Sponsor Utama" />
        </Field>
        <Field label="Jenis dukungan" htmlFor="support_type" error={errors.support_type} required>
          <Select id="support_type" value={data.support_type} onChange={(e) => setData('support_type', e.target.value)}>
            {supportTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </Field>
      </div>
      {data.support_type === 'cash' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nilai (Rp)" htmlFor="price_amount" error={errors.price_amount} hint="Kosongkan bila bisa dinegosiasi">
            <Input id="price_amount" type="number" min="0" value={data.price_amount} onChange={(e) => setData('price_amount', e.target.value)} error={errors.price_amount} />
          </Field>
          <Field label="Mata uang" htmlFor="currency" error={errors.currency}>
            <Input id="currency" value={data.currency} onChange={(e) => setData('currency', e.target.value.toUpperCase())} maxLength={3} />
          </Field>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Benefit" htmlFor="benefits" error={errors.benefits} hint="Satu per baris">
          <Textarea id="benefits" rows={4} value={data.benefits} onChange={(e) => setData('benefits', e.target.value)} placeholder={'Logo di panggung utama\nSebutan brand di media sosial'} />
        </Field>
        <Field label="Deliverable" htmlFor="deliverables" error={errors.deliverables} hint="Satu per baris">
          <Textarea id="deliverables" rows={4} value={data.deliverables} onChange={(e) => setData('deliverables', e.target.value)} placeholder={'Slot booth 3x3 m\n5 konten Instagram'} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ketersediaan" htmlFor="availability_status" error={errors.availability_status} required>
          <Select id="availability_status" value={data.availability_status} onChange={(e) => setData('availability_status', e.target.value)}>
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Catatan" htmlFor="notes" error={errors.notes} hint="Opsional">
          <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} error={errors.notes} />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        {pkg ? <Button type="button" variant="ghost" size="sm" onClick={onDone}>Batal</Button> : null}
        <Button type="submit" size="sm" disabled={processing}>{processing ? 'Menyimpan…' : pkg ? 'Simpan paket' : 'Tambah paket'}</Button>
      </div>
    </form>
  );
}

export default function EoEventDetail({ event, canEdit, canSubmit, canClose }) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState(null);
  const [showPackage, setShowPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmingClose, setConfirmingClose] = useState(false);

  function submitForReview() {
    router.post(`/eo/events/${event.id}/submit`, {}, { preserveScroll: true });
  }

  function closeEvent() {
    setConfirmingClose(true);
  }

  function confirmCloseEvent() {
    router.post(`/eo/events/${event.id}/close`, {}, {
      preserveScroll: true,
      onFinish: () => setConfirmingClose(false),
    });
  }

  function removeEvidence(evidence) {
    setPendingDelete({ type: 'evidence', item: evidence });
  }

  function removePackage(pkg) {
    setPendingDelete({ type: 'package', item: pkg });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const { type, item } = pendingDelete;
    if (type === 'evidence') {
      router.delete(`/eo/events/${event.id}/evidence/${item.id}`, {
        preserveScroll: true,
        onFinish: () => setPendingDelete(null),
      });
      return;
    }
    router.delete(`/eo/events/${event.id}/packages/${item.id}`, {
      preserveScroll: true,
      onFinish: () => setPendingDelete(null),
    });
  }

  return (
    <DashboardLayout
      eyebrow="Ruang kerja EO"
      title={event.title}
      actions={
        <>
          <StatusBadge status={event.status} />
          {canEdit ? (
            <Link href={`/eo/events/${event.id}/edit`} className={buttonClasses({ variant: 'outline' })}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Ubah
            </Link>
          ) : null}
        </>
      }
    >
      <Head title={event.title} />

      <Link href="/eo/events" className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary-strong hover:text-text">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar event
      </Link>

      {event.status === 'needs_changes' && event.moderation_reason_public ? (
        <div className="mb-6 rounded-[12px] border border-warning/30 bg-warning/10 px-4 py-3">
          <p className="text-xs font-medium text-warning-strong">CATATAN MODERATOR</p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{event.moderation_reason_public}</p>
          <p className="mt-2 text-xs text-text-secondary-strong">Perbaiki sesuai catatan lalu kirim ulang untuk review.</p>
        </div>
      ) : null}

      {event.status === 'rejected' && event.moderation_reason_public ? (
        <div className="mb-6 rounded-[12px] border border-danger/25 bg-danger/10 px-4 py-3">
          <p className="text-xs font-medium text-danger-strong">ALASAN PENOLAKAN</p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{event.moderation_reason_public}</p>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div className="min-w-0 space-y-8">
          <section className="rounded-[12px] border border-border bg-surface p-5">
            <div className="flex flex-wrap gap-x-7 gap-y-2 text-sm text-text-secondary-strong">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-text-muted" aria-hidden="true" />
                {formatDateRange(event.date_start, event.date_end)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-text-muted" aria-hidden="true" />
                {event.location}
              </span>
              <EvidenceTag tone="primary">{event.category}</EvidenceTag>
              <EvidenceTag>{event.format}</EvidenceTag>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-secondary-strong">{event.description}</p>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-semibold text-text">Bukti audiens</h2>
                <p className="mt-1 text-xs text-text-secondary-strong">Minimal satu bukti dengan sumber yang jelas sebelum dikirim.</p>
              </div>
              {canEdit && !showEvidence && !editingEvidence ? (
                <Button size="sm" variant="outline" onClick={() => setShowEvidence(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />Tambah
                </Button>
              ) : null}
            </div>

            {canEdit && showEvidence ? (
              <div className="mt-4">
                <EvidenceForm event={event} evidenceTypes={event.evidenceTypes ?? []} onDone={() => setShowEvidence(false)} />
              </div>
            ) : null}

            {event.evidence.length > 0 ? (
              <div className="mt-4 divide-y divide-border">
                {event.evidence.map((item) => (
                  <div key={item.id} className="py-4">
                    {canEdit && editingEvidence === item.id ? (
                      <EvidenceForm
                        event={event}
                        evidence={item}
                        evidenceTypes={event.evidenceTypes ?? []}
                        onDone={() => setEditingEvidence(null)}
                      />
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text">{evidenceTypeLabels[item.type] ?? item.type}</p>
                            <StatusBadge status={item.verification_status} />
                          </div>
                          <p className="mt-1 text-lg font-semibold tabular-nums text-text">
                            {formatNumber(item.value)} <span className="text-sm font-normal text-text-secondary-strong">{item.unit}</span>
                          </p>
                          <p className="mt-0.5 text-xs text-text-secondary-strong">{item.period} · Sumber: {item.source}</p>
                          {item.note ? <p className="mt-0.5 text-xs text-text-muted">{item.note}</p> : null}
                        </div>
                        {canEdit ? (
                          <div className="flex shrink-0 gap-1">
                            <button type="button" onClick={() => setEditingEvidence(item.id)} className="rounded-[8px] p-2 text-text-muted hover:bg-hover hover:text-text" aria-label="Ubah bukti">
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => removeEvidence(item)} className="rounded-[8px] p-2 text-text-muted hover:bg-hover hover:text-danger-strong" aria-label="Hapus bukti">
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-[10px] border border-dashed border-border px-4 py-4 text-sm text-text-secondary-strong">
                Belum ada bukti audiens. Tambahkan minimal satu agar event dapat dikirim untuk review.
              </p>
            )}
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-semibold text-text">Paket sponsorship</h2>
                <p className="mt-1 text-xs text-text-secondary-strong">Rincian benefit dan deliverable tiap paket.</p>
              </div>
              {canEdit && !showPackage && !editingPackage ? (
                <Button size="sm" variant="outline" onClick={() => setShowPackage(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />Tambah
                </Button>
              ) : null}
            </div>

            {canEdit && showPackage ? (
              <div className="mt-4">
                <PackageForm event={event} supportTypes={event.supportTypes ?? []} onDone={() => setShowPackage(false)} />
              </div>
            ) : null}

            {event.packages.length > 0 ? (
              <div className="mt-4 divide-y divide-border">
                {event.packages.map((pkg) => (
                  <div key={pkg.id} className="py-4">
                    {canEdit && editingPackage === pkg.id ? (
                      <PackageForm event={event} pkg={pkg} supportTypes={event.supportTypes ?? []} onDone={() => setEditingPackage(null)} />
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[15px] font-semibold text-text">{pkg.name}</h3>
                            <StatusBadge status={pkg.availability_status} />
                          </div>
                          <p className="mt-0.5 text-xs text-text-secondary-strong">
                            {supportTypeLabels[pkg.support_type] ?? pkg.support_type}
                            {pkg.support_type === 'cash' ? ` · ${formatCurrency(pkg.price_amount, pkg.currency)}` : ''}
                          </p>
                          {(pkg.benefits ?? []).length > 0 ? (
                            <p className="mt-2 text-xs leading-relaxed text-text-secondary">{pkg.benefits.join(' · ')}</p>
                          ) : null}
                        </div>
                        {canEdit ? (
                          <div className="flex shrink-0 gap-1">
                            <button type="button" onClick={() => setEditingPackage(pkg.id)} className="rounded-[8px] p-2 text-text-muted hover:bg-hover hover:text-text" aria-label="Ubah paket">
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => removePackage(pkg)} className="rounded-[8px] p-2 text-text-muted hover:bg-hover hover:text-danger-strong" aria-label="Hapus paket">
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-[10px] border border-dashed border-border px-4 py-4 text-sm text-text-secondary-strong">
                Belum ada paket sponsorship yang dicantumkan.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[12px] border border-border bg-background-muted p-5">
            <h2 className="text-sm font-semibold text-text">Langkah event</h2>
            <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-text-secondary-strong">
              <li className={cn('flex gap-2', event.evidence.length > 0 && 'text-text')}>
                <span className="tabular-nums">1.</span> Isi informasi dasar event.
              </li>
              <li className={cn('flex gap-2', event.evidence.length > 0 && 'text-text')}>
                <span className="tabular-nums">2.</span> Tambahkan bukti audiens bersumber.
              </li>
              <li className={cn('flex gap-2', event.packages.length > 0 && 'text-text')}>
                <span className="tabular-nums">3.</span> Cantumkan paket sponsorship.
              </li>
              <li className={cn('flex gap-2', event.status !== 'draft' && 'text-text')}>
                <span className="tabular-nums">4.</span> Kirim untuk moderasi admin.
              </li>
            </ol>
          </div>

          {canSubmit ? (
            <div className="rounded-[12px] border border-border p-5">
              <h2 className="text-sm font-semibold text-text">Kirim untuk review</h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
                Setelah dikirim, event tidak dapat diubah hingga admin memberikan keputusan.
              </p>
              <Button className="mt-4 w-full" onClick={submitForReview} disabled={event.evidence.length === 0}>
                <Send className="h-4 w-4" aria-hidden="true" />
                Kirim untuk review
              </Button>
              {event.evidence.length === 0 ? (
                <p className="mt-2 text-xs text-warning-strong">Tambahkan bukti audiens terlebih dahulu.</p>
              ) : null}
            </div>
          ) : null}

          {canClose ? (
            <div className="rounded-[12px] border border-border p-5">
              <h2 className="text-sm font-semibold text-text">Tutup event</h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
                Event yang ditutup tidak lagi tampil pada daftar peluang publik.
              </p>
              <Button variant="destructive-outline" className="mt-4 w-full" onClick={closeEvent}>
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Tutup event
              </Button>
            </div>
          ) : null}

          {event.status === 'under_review' ? (
            <div className="rounded-[12px] border border-info/25 bg-info/10 p-5">
              <p className="text-sm font-medium text-info-strong">Sedang ditinjau</p>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary-strong">
                Admin sedang memeriksa event Anda. Anda akan mendapat kabar setelah keputusan dibuat.
              </p>
            </div>
          ) : null}
        </aside>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete?.type === 'package' ? 'Hapus paket sponsorship?' : 'Hapus bukti audiens?'}
        description={
          pendingDelete?.type === 'package'
            ? `Paket "${pendingDelete?.item?.name}" akan dihapus dari event ini. Sponsor tidak akan lagi melihat paket tersebut.`
            : 'Bukti audiens ini akan dihapus dari event. Angka audiens publik dapat berubah setelahnya.'
        }
        confirmLabel={pendingDelete?.type === 'package' ? 'Ya, hapus paket' : 'Ya, hapus bukti'}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={confirmingClose}
        title="Tutup event ini?"
        description="Event tidak akan tampil pada daftar peluang publik. Pastikan seluruh rangkaian acara dan kewajiban sponsorship sudah selesai."
        confirmLabel="Ya, tutup event"
        onConfirm={confirmCloseEvent}
        onCancel={() => setConfirmingClose(false)}
      />
    </DashboardLayout>
  );
}
