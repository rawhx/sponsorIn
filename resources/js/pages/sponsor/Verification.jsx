import { Head, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { CheckCircle2, Info, Lock, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { Field, Input, Select } from '../../components/Form';
import { formatDate } from '../../lib/utils';

export default function SponsorVerification({ verification, legalForms, editable, registered_email }) {
  const intent = useRef(false);
  const { data, setData, put, processing, errors, transform } = useForm({
    business_name: verification.business_name ?? '',
    business_email: registered_email ?? verification.business_email ?? '',
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
    draft: 'Lengkapi seluruh data usaha, unggah dokumen legal pendukung, lalu kirimkan pengajuan verifikasi.',
    submitted: 'Pengajuan telah dikirim dan sedang menunggu antrean peninjauan oleh tim admin.',
    under_review: 'Pengajuan sedang ditinjau dan diperiksa keabsahan berkasnya oleh tim verifikator.',
    needs_information: 'Tim verifikator membutuhkan informasi tambahan. Silakan periksa catatan dan perbarui data.',
    rejected: 'Pengajuan belum memenuhi syarat. Perbaiki data sesuai arahan lalu kirim ulang.',
    approved: 'Verifikasi identitas usaha Anda telah disetujui. Akun Anda telah memiliki akses penuh.',
  };

  return (
    <DashboardLayout
      eyebrow="Data legal usaha"
      title="Verifikasi Identitas Sponsor"
      description="Verifikasi resmi menjamin transparansi dan keamanan kolaborasi antara sponsor dan event organizer."
      actions={<StatusBadge status={verification.status} />}
    >
      <Head title="Verifikasi Sponsor" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Column */}
        <div className="min-w-0 space-y-6">
          {/* Status Banner Card */}
          <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-semibold text-text">Status Pengajuan</h2>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">{statusMessage[verification.status]}</p>
              </div>
            </div>

            {verification.decision_reason_public && ['needs_information', 'rejected', 'approved'].includes(verification.status) && (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
                <p className="text-xs font-semibold text-warning-strong uppercase tracking-wider">Catatan Tim Peninjau</p>
                <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{verification.decision_reason_public}</p>
              </div>
            )}

            <dl className="grid gap-4 border-t border-border/60 pt-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-text-muted">Tanggal Dikirim</dt>
                <dd className="mt-0.5 font-medium text-text">{verification.submitted_at ? formatDate(verification.submitted_at) : 'Belum dikirim'}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Terakhir Ditinjau</dt>
                <dd className="mt-0.5 font-medium text-text">{verification.reviewed_at ? formatDate(verification.reviewed_at) : 'Belum ditinjau'}</dd>
              </div>
            </dl>
          </div>

          {/* Form (if editable) or Readonly Display */}
          {editable ? (
            <form onSubmit={submit} className="space-y-6">
              {/* Identity Section */}
              <section className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-5">
                <div className="border-b border-border/70 pb-4">
                  <h2 className="text-base font-semibold text-text">Identitas Badan Usaha</h2>
                  <p className="mt-0.5 text-xs text-text-secondary">Nama resmi perusahaan dan bentuk hukum yang terdaftar di Kemenkumham/OSS</p>
                </div>

                <Field label="Nama badan usaha resmi" htmlFor="business_name" error={errors.business_name} required>
                  <Input
                    id="business_name"
                    value={data.business_name}
                    onChange={(event) => setData('business_name', event.target.value)}
                    error={errors.business_name}
                    placeholder="PT / CV / Yayasan Nama Usaha"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Email usaha"
                    htmlFor="business_email"
                    error={errors.business_email}
                    required
                    hint="Sesuai akun registrasi"
                  >
                    <Input
                      id="business_email"
                      type="email"
                      value={data.business_email}
                      readOnly
                      error={errors.business_email}
                    />
                  </Field>

                  <Field label="Bentuk badan hukum" htmlFor="legal_form" error={errors.legal_form} required>
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
              </section>

              {/* Sensitive Identifiers Section */}
              <section className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-5">
                <div className="border-b border-border/70 pb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold text-text">Dokumen & Nomor Identitas Usaha</h2>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    NIB dan NPWP disimpan terenkripsi di server kami. Hanya tim admin yang dapat memverifikasi.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="NIB (Nomor Induk Berusaha)"
                    htmlFor="nib"
                    error={errors.nib}
                    hint={verification.has_nib ? `Tersimpan: ${verification.nib_masked}` : 'Wajib diisi'}
                    required={!verification.has_nib}
                  >
                    <Input
                      id="nib"
                      inputMode="numeric"
                      autoComplete="off"
                      value={data.nib}
                      onChange={(event) => setData('nib', event.target.value)}
                      error={errors.nib}
                      placeholder={verification.has_nib ? 'Kosongkan jika tidak diubah' : '13 digit nomor NIB'}
                    />
                  </Field>

                  <Field
                    label="NPWP Badan Usaha"
                    htmlFor="tax_id"
                    error={errors.tax_id}
                    hint={verification.has_tax_id ? `Tersimpan: ${verification.tax_id_masked}` : 'Wajib diisi'}
                    required={!verification.has_tax_id}
                  >
                    <Input
                      id="tax_id"
                      inputMode="numeric"
                      autoComplete="off"
                      value={data.tax_id}
                      onChange={(event) => setData('tax_id', event.target.value)}
                      error={errors.tax_id}
                      placeholder={verification.has_tax_id ? 'Kosongkan jika tidak diubah' : '15-16 digit NPWP'}
                    />
                  </Field>
                </div>

                <Field
                  label="Dokumen Legal Pendukung"
                  htmlFor="supporting_document"
                  error={errors.supporting_document}
                  hint="Berkas PDF, JPG, atau PNG (maks. 5 MB) · NIB OSS / SK Kemenkumham"
                  required={!verification.has_document}
                >
                  <div className="rounded-xl border border-dashed border-border/80 bg-background/50 p-5 text-center">
                    {verification.has_document ? (
                      <div className="mb-3 flex items-center justify-center gap-2 text-xs font-medium text-success-strong">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>Dokumen pendukung telah tersimpan sebelumnya. Unggah berkas baru untuk memperbarui.</span>
                      </div>
                    ) : (
                      <p className="mb-3 text-xs text-text-secondary">Belum ada dokumen yang tersimpan.</p>
                    )}
                    <input
                      id="supporting_document"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) => setData('supporting_document', event.target.files?.[0] ?? null)}
                      className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-xl file:border file:border-slate-200 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-50 cursor-pointer"
                    />
                  </div>
                </Field>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3">
                <Button
                  type="submit"
                  variant="outline"
                  onClick={() => { intent.current = false; }}
                  loading={processing && !intent.current}
                  className="w-full sm:w-auto"
                >
                  Simpan sebagai Draft
                </Button>
                <Button
                  type="submit"
                  onClick={() => { intent.current = true; }}
                  loading={processing && intent.current}
                  className="w-full sm:w-auto"
                >
                  Kirim Pengajuan Verifikasi
                </Button>
              </div>

              <p className="text-center text-[11px] leading-relaxed text-text-muted">
                Dengan mengirimkan berkas, Anda menyatakan bahwa seluruh informasi identitas dan dokumen yang diunggah adalah sah milik badan usaha Anda.
              </p>
            </form>
          ) : (
            /* Readonly summary */
            <section className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
              <div className="border-b border-border/70 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-text">Data yang Diajukan</h2>
                <p className="mt-0.5 text-xs text-text-secondary">Data yang telah diverifikasi bersifat permanen</p>
              </div>
              <dl className="divide-y divide-border/60 text-xs">
                <div className="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:px-6">
                  <dt className="text-text-muted">Nama Badan Usaha</dt>
                  <dd className="font-semibold text-text">{verification.business_name}</dd>
                </div>
                <div className="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:px-6">
                  <dt className="text-text-muted">Email Usaha</dt>
                  <dd className="text-text">{verification.business_email}</dd>
                </div>
                <div className="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:px-6">
                  <dt className="text-text-muted">Bentuk Hukum</dt>
                  <dd className="font-medium text-text uppercase">{verification.legal_form ?? '—'}</dd>
                </div>
                <div className="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:px-6">
                  <dt className="text-text-muted">NIB (Nomor Induk Berusaha)</dt>
                  <dd className="tabular-nums font-mono text-text">{verification.nib_masked ?? '—'}</dd>
                </div>
                <div className="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:px-6">
                  <dt className="text-text-muted">NPWP Badan Usaha</dt>
                  <dd className="tabular-nums font-mono text-text">{verification.tax_id_masked ?? '—'}</dd>
                </div>
                <div className="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:px-6">
                  <dt className="text-text-muted">Dokumen Pendukung</dt>
                  <dd className="text-text">{verification.has_document ? 'Tersimpan aman di penyimpanan terproteksi' : 'Tidak ada berkas'}</dd>
                </div>
              </dl>
            </section>
          )}
        </div>

        {/* Aside Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Perlindungan Data Legal</h2>
            </div>
            <ul className="space-y-2.5 text-xs text-text-secondary leading-relaxed divide-y divide-border/40">
              <li className="pt-2">NIB dan NPWP dienkripsi secara simetris tingkat industri pada database.</li>
              <li className="pt-2">Dokumen legal disimpan di storage privat; tidak ada URL publik yang terbuka ke internet.</li>
              <li className="pt-2">Hanya verifikator terotorisasi dengan peran admin yang dapat meninjau dokumen.</li>
              <li className="pt-2">Setiap keputusan dan perubahan status tercatat secara permanen di audit trail.</li>
            </ul>
          </div>

          {['submitted', 'under_review'].includes(verification.status) && (
            <div className="rounded-2xl border border-border/80 bg-background/60 p-5 text-xs text-text-secondary space-y-2">
              <h3 className="font-semibold text-text flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" />
                Selama Menunggu Peninjauan
              </h3>
              <p className="leading-relaxed">
                Anda tetap dapat menjelajahi katalog event publik. Fitur shortlist dan pengiriman minat ke EO akan aktif otomatis segera setelah pengajuan diverifikasi.
              </p>
            </div>
          )}
        </aside>
      </div>
    </DashboardLayout>
  );
}
