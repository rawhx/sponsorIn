import { Head, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { Field, Input, Select } from '../../components/Form';
import { formatDate } from '../../lib/utils';

export default function SponsorVerification({ verification, legalForms, editable }) {
  const intent = useRef(false);
  const { data, setData, put, processing, errors, transform } = useForm({
    business_name: verification.business_name ?? '',
    business_email: verification.business_email ?? '',
    legal_form: verification.legal_form ?? '',
    nib: '',
    tax_id: '',
    supporting_document: null,
  });

  function submit(event) {
    event.preventDefault();
    transform((formData) => ({ ...formData, submit: intent.current }));
    put('/sponsor/verification', {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => {
        intent.current = false;
      },
    });
  }

  const statusMessage = {
    draft: 'Lengkapi seluruh data usaha, unggah dokumen pendukung, lalu kirim pengajuan.',
    submitted: 'Pengajuan sudah dikirim dan menunggu peninjauan admin.',
    under_review: 'Pengajuan sedang ditinjau admin atau verifier.',
    needs_information: 'Admin membutuhkan informasi tambahan. Perbarui data lalu kirim ulang.',
    rejected: 'Pengajuan belum disetujui. Perbaiki data lalu kirim ulang.',
    approved: 'Verifikasi usaha disetujui. Data berikut tidak dapat diubah dari halaman ini.',
  };

  return (
    <DashboardLayout
      eyebrow="Data usaha"
      title="Verifikasi sponsor"
      actions={<StatusBadge status={verification.status} />}
    >
      <Head title="Verifikasi sponsor" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div>
          <div className="rounded-[12px] border border-border bg-surface p-5">
            <p className="text-sm leading-relaxed text-text-secondary-strong">{statusMessage[verification.status]}</p>
            {verification.decision_reason_public && ['needs_information', 'rejected', 'approved'].includes(verification.status) ? (
              <div className="mt-4 rounded-[8px] border border-border bg-background-muted px-4 py-3">
                <p className="text-xs font-medium text-text-muted">CATATAN DARI REVIEW</p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{verification.decision_reason_public}</p>
              </div>
            ) : null}
            <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-text-muted">Diajukan</dt>
                <dd className="mt-0.5 text-text-secondary-strong">{verification.submitted_at ? formatDate(verification.submitted_at) : 'Belum dikirim'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Ditinjau</dt>
                <dd className="mt-0.5 text-text-secondary-strong">{verification.reviewed_at ? formatDate(verification.reviewed_at) : 'Belum ditinjau'}</dd>
              </div>
            </dl>
          </div>

          {editable ? (
            <form onSubmit={submit} className="mt-6 space-y-6">
              <section className="rounded-[12px] border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-sm font-semibold text-text">Identitas usaha</h2>
                  <p className="mt-1 text-xs text-text-secondary-strong">Nama dan email usaha akan tampil pada profil publik.</p>
                </div>
                <div className="space-y-5 px-5 py-5">
                  <Field label="Nama badan usaha" htmlFor="business_name" error={errors.business_name} required>
                    <Input
                      id="business_name"
                      value={data.business_name}
                      onChange={(event) => setData('business_name', event.target.value)}
                      error={errors.business_name}
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Email usaha" htmlFor="business_email" error={errors.business_email} required>
                      <Input
                        id="business_email"
                        type="email"
                        value={data.business_email}
                        onChange={(event) => setData('business_email', event.target.value)}
                        error={errors.business_email}
                      />
                    </Field>
                    <Field label="Bentuk hukum" htmlFor="legal_form" error={errors.legal_form} required>
                      <Select
                        id="legal_form"
                        value={data.legal_form}
                        onChange={(event) => setData('legal_form', event.target.value)}
                        error={errors.legal_form}
                      >
                        <option value="">Pilih bentuk hukum</option>
                        {legalForms.map((form) => (
                          <option key={form.value} value={form.value}>{form.label}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </div>
              </section>

              <section className="rounded-[12px] border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-sm font-semibold text-text">Data sensitif</h2>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                    NIB dan NPWP disimpan terenkripsi. Nilai lengkap tidak dikirim kembali ke browser; isi hanya jika ingin menambah atau mengganti.
                  </p>
                </div>
                <div className="space-y-5 px-5 py-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="NIB"
                      htmlFor="nib"
                      error={errors.nib}
                      hint={verification.has_nib ? `Tersimpan: ${verification.nib_masked}` : 'Belum diisi'}
                      required={!verification.has_nib}
                    >
                      <Input
                        id="nib"
                        inputMode="numeric"
                        autoComplete="off"
                        value={data.nib}
                        onChange={(event) => setData('nib', event.target.value)}
                        error={errors.nib}
                        placeholder={verification.has_nib ? 'Kosongkan untuk mempertahankan' : 'Nomor Induk Berusaha'}
                      />
                    </Field>
                    <Field
                      label="NPWP"
                      htmlFor="tax_id"
                      error={errors.tax_id}
                      hint={verification.has_tax_id ? `Tersimpan: ${verification.tax_id_masked}` : 'Belum diisi'}
                      required={!verification.has_tax_id}
                    >
                      <Input
                        id="tax_id"
                        inputMode="numeric"
                        autoComplete="off"
                        value={data.tax_id}
                        onChange={(event) => setData('tax_id', event.target.value)}
                        error={errors.tax_id}
                        placeholder={verification.has_tax_id ? 'Kosongkan untuk mempertahankan' : 'Nomor Pokok Wajib Pajak'}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Dokumen pendukung"
                    htmlFor="supporting_document"
                    error={errors.supporting_document}
                    hint="PDF, JPG, atau PNG · maks. 5 MB"
                    required={!verification.has_document}
                  >
                    <div className="rounded-[8px] border border-dashed border-border bg-background-muted px-4 py-4">
                      {verification.has_document ? (
                        <p className="mb-3 inline-flex items-center gap-2 text-xs text-text-secondary-strong">
                          <FileText className="h-4 w-4" aria-hidden="true" />
                          Dokumen sudah tersimpan. Unggah berkas baru untuk menggantinya.
                        </p>
                      ) : (
                        <p className="mb-3 text-xs text-text-secondary-strong">Belum ada dokumen tersimpan.</p>
                      )}
                      <input
                        id="supporting_document"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(event) => setData('supporting_document', event.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-text-secondary-strong file:mr-3 file:rounded-[8px] file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-text hover:file:bg-hover"
                      />
                    </div>
                  </Field>
                </div>
              </section>

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="submit"
                  variant="outline"
                  onClick={() => { intent.current = false; }}
                  disabled={processing}
                >
                  Simpan draft
                </Button>
                <Button
                  type="submit"
                  onClick={() => { intent.current = true; }}
                  disabled={processing}
                >
                  {processing ? 'Menyimpan…' : 'Kirim pengajuan'}
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-text-muted">
                Dengan mengirim pengajuan, Anda menyatakan data yang diisi benar dan dokumen yang diunggah milik usaha Anda.
              </p>
            </form>
          ) : (
            <section className="mt-6 rounded-[12px] border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-text">Data yang diajukan</h2>
              </div>
              <dl className="divide-y divide-border">
                <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs text-text-muted">Nama badan usaha</dt>
                  <dd className="text-sm text-text">{verification.business_name}</dd>
                </div>
                <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs text-text-muted">Email usaha</dt>
                  <dd className="text-sm text-text">{verification.business_email}</dd>
                </div>
                <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs text-text-muted">Bentuk hukum</dt>
                  <dd className="text-sm text-text">{verification.legal_form?.toUpperCase() ?? '—'}</dd>
                </div>
                <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs text-text-muted">NIB</dt>
                  <dd className="text-sm tabular-nums text-text">{verification.nib_masked ?? '—'}</dd>
                </div>
                <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs text-text-muted">NPWP</dt>
                  <dd className="text-sm tabular-nums text-text">{verification.tax_id_masked ?? '—'}</dd>
                </div>
                <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs text-text-muted">Dokumen</dt>
                  <dd className="text-sm text-text">{verification.has_document ? 'Tersimpan, hanya dapat diakses admin' : 'Tidak ada'}</dd>
                </div>
              </dl>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[12px] border border-border bg-background-muted p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary-strong" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text">Cara data dijaga</h2>
            </div>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-text-secondary-strong">
              <li>NIB dan NPWP disimpan dengan enkripsi.</li>
              <li>Dokumen disimpan pada penyimpanan privat, bukan URL publik.</li>
              <li>Hanya admin dan verifier yang dapat mengunduh dokumen.</li>
              <li>Nilai sensitif tidak ditampilkan kembali di formulir.</li>
              <li>Setiap keputusan dicatat pada audit log internal.</li>
            </ul>
          </div>
          {['submitted', 'under_review'].includes(verification.status) ? (
            <div className="rounded-[12px] border border-border p-5">
              <h2 className="text-sm font-semibold text-text">Selama menunggu</h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
                Anda masih dapat menjelajahi event publik. Fitur shortlist dan proposal aktif setelah verifikasi disetujui.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </DashboardLayout>
  );
}
