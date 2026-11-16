import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, CalendarDays, MapPin, Pencil, Plus, Send, Trash2, XCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge, { EvidenceTag } from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, Input, Select } from '../../components/Form';
import { cn, evidenceTypeLabels, formatCurrency, formatDateRange, formatEvidencePeriod, formatNumber, supportTypeLabels } from '../../lib/utils';

const availabilityOptions = [
  { value: 'available', label: 'Tersedia' },
  { value: 'limited', label: 'Terbatas' },
  { value: 'closed', label: 'Ditutup' },
];

function emptyEvidence() {
  return { evidence_type: 'projection', value: '', unit: 'orang', period_start: '', period_end: '', source_description: '', evidence_note: '' };
}

function EvidenceForm({ event, evidence, evidenceTypes, onDone }) {
  const initial = evidence
    ? {
        evidence_type: evidence.type,
        value: evidence.value,
        unit: evidence.unit,
        period_start: evidence.period_start ?? '',
        period_end: evidence.period_end ?? '',
        source_description: evidence.source,
        evidence_note: evidence.note ?? '',
      }
    : emptyEvidence();
  const { data, setData, post, put, processing, errors, reset } = useForm(initial);
  const sourceOptions = event.evidenceSources ?? [];
  const legacySource = evidence?.source && !sourceOptions.includes(evidence.source) ? evidence.source : null;
  const allSources = legacySource ? [legacySource, ...sourceOptions] : sourceOptions;

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
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Jenis Bukti" htmlFor="evidence_type" error={errors.evidence_type} required>
          <Select id="evidence_type" value={data.evidence_type} onChange={(e) => setData('evidence_type', e.target.value)}>
            {evidenceTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Nilai Angka" htmlFor="value" error={errors.value} required>
          <Input id="value" type="number" min="0" value={data.value} onChange={(e) => setData('value', e.target.value)} error={errors.value} />
        </Field>
        <Field label="Satuan" htmlFor="unit" error={errors.unit} required>
          <Input id="unit" value={data.unit} onChange={(e) => setData('unit', e.target.value)} error={errors.unit} placeholder="orang / tiket / klik" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Periode Mulai" htmlFor="period_start" error={errors.period_start} required>
          <Input id="period_start" type="date" value={data.period_start} onChange={(e) => setData('period_start', e.target.value)} error={errors.period_start} />
        </Field>
        <Field label="Periode Selesai" htmlFor="period_end" error={errors.period_end} required>
          <Input id="period_end" type="date" value={data.period_end} onChange={(e) => setData('period_end', e.target.value)} error={errors.period_end} />
        </Field>
      </div>
      <Field label="Sumber Data" htmlFor="source_description" error={errors.source_description} required hint="Pilih sumber yang paling obyektif">
        <Select id="source_description" value={data.source_description} onChange={(e) => setData('source_description', e.target.value)} error={errors.source_description}>
          <option value="">Pilih sumber data</option>
          {allSources.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </Select>
      </Field>
      <Field label="Catatan Tambahan" htmlFor="evidence_note" error={errors.evidence_note} hint="Opsional">
        <Input id="evidence_note" value={data.evidence_note} onChange={(e) => setData('evidence_note', e.target.value)} error={errors.evidence_note} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        {evidence ? (
          <Button type="button" variant="outline" size="sm" onClick={onDone}>Batal</Button>
        ) : null}
        <Button type="submit" size="sm" disabled={processing}>{processing ? 'Menyimpan…' : evidence ? 'Simpan Bukti' : 'Tambahkan Bukti'}</Button>
      </div>
    </form>
  );
}

function RepeatableField({ id, label, hint, items, field, errors, placeholder, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`${id}-0`} className="app-field-label text-sm font-semibold text-slate-700">{label}</label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      <div className="space-y-2">
        {items.map((item, index) => {
          const error = errors?.[`${field}.${index}`];

          return (
            <div key={index} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  id={`${id}-${index}`}
                  value={item}
                  onChange={(event) => onChange(index, event.target.value)}
                  error={error}
                  placeholder={placeholder}
                  maxLength={300}
                />
                {error ? <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="mt-0.5 rounded-lg p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                aria-label={`Hapus ${label.toLowerCase()} ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAdd} className="mt-1">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Tambah {label.toLowerCase()}
      </Button>
    </div>
  );
}

function PackageForm({ event, supportTypes, pkg, onDone }) {
  const initial = pkg
    ? {
        name: pkg.name,
        support_type: pkg.support_type,
        price_amount: pkg.price_amount ?? '',
        currency: pkg.currency ?? 'IDR',
        benefits: Array.isArray(pkg.benefits) && pkg.benefits.length > 0 ? pkg.benefits : [''],
        deliverables: Array.isArray(pkg.deliverables) && pkg.deliverables.length > 0 ? pkg.deliverables : [''],
        availability_status: pkg.availability_status,
        notes: pkg.notes ?? '',
      }
    : { name: '', support_type: 'cash', price_amount: '', currency: 'IDR', benefits: [''], deliverables: [''], availability_status: 'available', notes: '' };

  const { data, setData, post, put, processing, errors, transform } = useForm(initial);

  function updateItem(field, index, value) {
    setData(field, data[field].map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function addItem(field) {
    setData(field, [...data[field], '']);
  }

  function removeItem(field, index) {
    const next = data[field].filter((_, itemIndex) => itemIndex !== index);
    setData(field, next.length > 0 ? next : ['']);
  }

  function submit(submitEvent) {
    submitEvent.preventDefault();
    transform((formData) => ({
      ...formData,
      benefits: formData.benefits.map((line) => line.trim()).filter(Boolean),
      deliverables: formData.deliverables.map((line) => line.trim()).filter(Boolean),
    }));
    const options = { preserveScroll: true, onSuccess: () => onDone?.() };
    if (pkg) {
      put(`/eo/events/${event.id}/packages/${pkg.id}`, options);
    } else {
      post(`/eo/events/${event.id}/packages`, options);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Paket" htmlFor="name" error={errors.name} required>
          <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} placeholder="Mis. Platinum Sponsor" />
        </Field>
        <Field label="Bentuk Dukungan" htmlFor="support_type" error={errors.support_type} required>
          <Select id="support_type" value={data.support_type} onChange={(e) => setData('support_type', e.target.value)}>
            {supportTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </Field>
      </div>
      {data.support_type === 'cash' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nominal Harga (Rp)" htmlFor="price_amount" error={errors.price_amount} hint="Dapat dinegosiasi jika kosong">
            <Input id="price_amount" type="number" min="0" value={data.price_amount} onChange={(e) => setData('price_amount', e.target.value)} error={errors.price_amount} />
          </Field>
          <Field label="Mata Uang" htmlFor="currency" error={errors.currency}>
            <Input id="currency" value={data.currency} onChange={(e) => setData('currency', e.target.value.toUpperCase())} maxLength={3} />
          </Field>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <RepeatableField
          id="benefits"
          label="Benefit Sponsor"
          hint="Satu baris per benefit"
          items={data.benefits}
          field="benefits"
          errors={errors}
          placeholder="Mis. Pencantuman logo pada backdrop utama"
          onChange={(index, value) => updateItem('benefits', index, value)}
          onAdd={() => addItem('benefits')}
          onRemove={(index) => removeItem('benefits', index)}
        />
        <RepeatableField
          id="deliverables"
          label="Deliverable (Kewajiban)"
          hint="Satu baris per deliverable"
          items={data.deliverables}
          field="deliverables"
          errors={errors}
          placeholder="Mis. Booth pameran ukuran 3x3 meter"
          onChange={(index, value) => updateItem('deliverables', index, value)}
          onAdd={() => addItem('deliverables')}
          onRemove={(index) => removeItem('deliverables', index)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status Ketersediaan" htmlFor="availability_status" error={errors.availability_status} required>
          <Select id="availability_status" value={data.availability_status} onChange={(e) => setData('availability_status', e.target.value)}>
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Catatan Tambahan" htmlFor="notes" error={errors.notes} hint="Opsional">
          <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} error={errors.notes} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {pkg ? <Button type="button" variant="outline" size="sm" onClick={onDone}>Batal</Button> : null}
        <Button type="submit" size="sm" disabled={processing}>{processing ? 'Menyimpan…' : pkg ? 'Simpan Paket' : 'Tambahkan Paket'}</Button>
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
      eyebrow="Detail Dossier Event"
      title={event.title}
      actions={
        <div className="flex items-center gap-2">
          <StatusBadge status={event.status} />
          {canEdit ? (
            <Link href={`/eo/events/${event.id}/edit`} className={buttonClasses({ variant: 'outline', size: 'sm' })}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Ubah Data
            </Link>
          ) : null}
        </div>
      }
    >
      <Head title={event.title} />

      <Link href="/eo/events" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar event
      </Link>

      {event.status === 'needs_changes' && event.moderation_reason_public ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-xs">
          <p className="text-xs font-bold tracking-wider uppercase text-amber-700">Catatan Perbaikan dari Moderator</p>
          <p className="mt-1.5 text-sm leading-relaxed">{event.moderation_reason_public}</p>
          <p className="mt-2 text-xs text-amber-700">Silakan lengkapi atau perbaiki data sesuai catatan, kemudian kirim ulang event untuk review.</p>
        </div>
      ) : null}

      {event.status === 'rejected' && event.moderation_reason_public ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-xs">
          <p className="text-xs font-bold tracking-wider uppercase text-rose-700">Alasan Penolakan</p>
          <p className="mt-1.5 text-sm leading-relaxed">{event.moderation_reason_public}</p>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="min-w-0 space-y-8">
          {/* General info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm font-medium text-slate-600">
              <span className="inline-flex items-center gap-2 tabular-nums">
                <CalendarDays className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {formatDateRange(event.date_start, event.date_end)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {event.location}
              </span>
              <EvidenceTag tone="primary">{event.category}</EvidenceTag>
              <EvidenceTag>{event.format}</EvidenceTag>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm sm:text-[15px] leading-relaxed text-slate-700">{event.description}</p>
          </section>

          {/* Evidence section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Bukti Audiens Terverifikasi</h2>
                <p className="text-xs text-slate-500">Minimal 1 berkas bukti bersumber sebelum event diajukan untuk moderasi.</p>
              </div>
              {canEdit && !showEvidence && !editingEvidence ? (
                <Button size="sm" variant="outline" onClick={() => setShowEvidence(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />Tambah Bukti
                </Button>
              ) : null}
            </div>

            {canEdit && showEvidence ? (
              <div className="mt-5">
                <EvidenceForm event={event} evidenceTypes={event.evidenceTypes ?? []} onDone={() => setShowEvidence(false)} />
              </div>
            ) : null}

            {event.evidence.length > 0 ? (
              <div className="mt-4 divide-y divide-slate-100">
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
                            <p className="text-sm font-bold text-slate-900">{evidenceTypeLabels[item.type] ?? item.type}</p>
                            <StatusBadge status={item.verification_status} />
                          </div>
                          <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                            {formatNumber(item.value)} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600 font-medium">{formatEvidencePeriod(item)} · Sumber: {item.source}</p>
                          {item.note ? <p className="mt-0.5 text-xs text-slate-400 italic">{item.note}</p> : null}
                        </div>
                        {canEdit ? (
                          <div className="flex shrink-0 gap-1">
                            <button type="button" onClick={() => setEditingEvidence(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors" aria-label="Ubah bukti">
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => removeEvidence(item)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" aria-label="Hapus bukti">
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
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
                Belum ada bukti audiens. Tambahkan minimal satu bukti agar event dapat diajukan untuk review publikasi.
              </div>
            )}
          </section>

          {/* Packages section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Paket Sponsorship</h2>
                <p className="text-xs text-slate-500">Rincian benefit dan deliverable yang ditawarkan ke brand sponsor.</p>
              </div>
              {canEdit && !showPackage && !editingPackage ? (
                <Button size="sm" variant="outline" onClick={() => setShowPackage(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />Tambah Paket
                </Button>
              ) : null}
            </div>

            {canEdit && showPackage ? (
              <div className="mt-5">
                <PackageForm event={event} supportTypes={event.supportTypes ?? []} onDone={() => setShowPackage(false)} />
              </div>
            ) : null}

            {event.packages.length > 0 ? (
              <div className="mt-4 divide-y divide-slate-100">
                {event.packages.map((pkg) => (
                  <div key={pkg.id} className="py-5">
                    {canEdit && editingPackage === pkg.id ? (
                      <PackageForm event={event} pkg={pkg} supportTypes={event.supportTypes ?? []} onDone={() => setEditingPackage(null)} />
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>
                            <StatusBadge status={pkg.availability_status} />
                          </div>
                          <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                            {supportTypeLabels[pkg.support_type] ?? pkg.support_type}
                            {pkg.support_type === 'cash' ? ` · ${formatCurrency(pkg.price_amount, pkg.currency)}` : ''}
                          </p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Benefit</p>
                              {(pkg.benefits ?? []).length > 0 ? (
                                <ul className="mt-1 space-y-1">
                                  {pkg.benefits.map((benefit, index) => (
                                    <li key={index} className="text-xs leading-relaxed text-slate-600">• {benefit}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="mt-1 text-xs text-slate-400">Tidak dirinci.</p>
                              )}
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Deliverable</p>
                              {(pkg.deliverables ?? []).length > 0 ? (
                                <ul className="mt-1 space-y-1">
                                  {pkg.deliverables.map((deliverable, index) => (
                                    <li key={index} className="text-xs leading-relaxed text-slate-600">• {deliverable}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="mt-1 text-xs text-slate-400">Tidak dirinci.</p>
                              )}
                            </div>
                          </div>
                        </div>
                        {canEdit ? (
                          <div className="flex shrink-0 gap-1">
                            <button type="button" onClick={() => setEditingPackage(pkg.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors" aria-label="Ubah paket">
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => removePackage(pkg)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" aria-label="Hapus paket">
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
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
                Belum ada paket sponsorship yang dicantumkan.
              </div>
            )}
          </section>
        </div>

        {/* Aside stepper & submit */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Checklist Kelengkapan Event</h2>
            <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-600">
              <li className={cn('flex gap-2', event.evidence.length > 0 && 'text-emerald-800 font-semibold')}>
                <span>1.</span> Isi informasi dasar & deskripsi.
              </li>
              <li className={cn('flex gap-2', event.evidence.length > 0 && 'text-emerald-800 font-semibold')}>
                <span>2.</span> Lampirkan bukti audiens bersumber.
              </li>
              <li className={cn('flex gap-2', event.packages.length > 0 && 'text-emerald-800 font-semibold')}>
                <span>3.</span> Buat paket sponsorship & benefit.
              </li>
              <li className={cn('flex gap-2', event.status !== 'draft' && 'text-emerald-800 font-semibold')}>
                <span>4.</span> Ajukan event untuk moderasi admin.
              </li>
            </ol>
          </div>

          {canSubmit ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900">Ajukan Publikasi Event</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                Setelah diajukan, event tidak dapat diubah sementara waktu hingga tim admin/verifier memberikan keputusan.
              </p>
              <Button className="mt-4 w-full" onClick={submitForReview} disabled={event.evidence.length === 0}>
                <Send className="h-4 w-4" aria-hidden="true" />
                Ajukan untuk Moderasi
              </Button>
              {event.evidence.length === 0 ? (
                <p className="mt-2 text-xs font-medium text-amber-600">Tambahkan minimal 1 bukti audiens terlebih dahulu.</p>
              ) : null}
            </div>
          ) : null}

          {canClose ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900">Tutup Peluang Event</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                Event yang ditutup tidak lagi tampil di daftar peluang sponsor.
              </p>
              <Button variant="destructive-outline" className="mt-4 w-full" onClick={closeEvent}>
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Tutup Event Ini
              </Button>
            </div>
          ) : null}

          {event.status === 'under_review' ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sky-900">
              <p className="text-sm font-bold text-sky-900">Sedang Ditinjau Tim Moderasi</p>
              <p className="mt-1 text-xs leading-relaxed text-sky-700">
                Event Anda sedang dalam proses verifikasi berkas oleh admin SponsorIn. Notifikasi akan dikirimkan begitu keputusan dibuat.
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
