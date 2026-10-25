import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, FileText, ShieldAlert } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, Select, Textarea } from '../../components/Form';
import { formatDate, legalFormLabels } from '../../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';

  return formatDate(value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function VerificationDetail({ verification, auditLogs }) {
  const allowed = verification.allowed_decisions ?? [];
  const { data, setData, post, processing, errors } = useForm({
    decision: allowed[0] ?? '',
    reason_internal: '',
    reason_public: '',
  });

  const [confirmingReject, setConfirmingReject] = useState(false);
  const needsPublicReason = ['needs_information', 'rejected', 'suspended'].includes(data.decision);

  function persist() {
    post(`/admin/verifications/${verification.id}/decision`, { preserveScroll: true });
  }

  function submit(event) {
    event.preventDefault();
    if (data.decision === 'rejected') {
      setConfirmingReject(true);
      return;
    }
    persist();
  }

  const isFinal = ['approved', 'rejected'].includes(verification.status) && verification.reviewed_at;

  return (
    <DashboardLayout
      eyebrow="Verifikasi sponsor"
      title={verification.organization_name}
      actions={<StatusBadge status={verification.status} />}
    >
      <Head title={`Verifikasi · ${verification.organization_name}`} />

      <Link href="/admin/verifications" className="inline-flex items-center gap-2 text-sm text-text-secondary-strong hover:text-text">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke antrean
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <div className="space-y-6">
          <section className="rounded-[12px] border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-text">Data pengajuan</h2>
              <p className="mt-1 text-xs text-text-secondary-strong">Data sensitif ditampilkan hanya pada halaman admin yang terproteksi.</p>
            </div>
            <dl className="divide-y divide-border">
              {[
                ['Nama badan usaha', verification.legal_name],
                ['Nama kontak', verification.contact_name],
                ['Email akun', verification.contact_email],
                ['Email usaha', verification.business_email ?? '—'],
                ['Bentuk hukum', legalFormLabels[verification.legal_form] ?? '—'],
                ['NIB', verification.nib ?? '—'],
                ['NPWP', verification.tax_id ?? '—'],
                ['Diajukan', formatDateTime(verification.submitted_at)],
                ['Ditinjau', formatDateTime(verification.reviewed_at)],
                ['Peninjau', verification.reviewer_name ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs text-text-muted">{label}</dt>
                  <dd className="break-words text-sm text-text">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-border px-5 py-4">
              {verification.has_document ? (
                <a
                  href={`/admin/verifications/${verification.id}/document`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-strong hover:text-text"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Unduh dokumen pendukung
                </a>
              ) : (
                <p className="text-sm text-text-secondary-strong">Tidak ada dokumen pendukung.</p>
              )}
            </div>
          </section>

          {verification.decision_reason_internal || verification.decision_reason_public ? (
            <section className="rounded-[12px] border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-text">Catatan keputusan sebelumnya</h2>
              </div>
              <div className="space-y-4 px-5 py-4">
                {verification.decision_reason_public ? (
                  <div>
                    <p className="text-xs text-text-muted">Alasan publik</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{verification.decision_reason_public}</p>
                  </div>
                ) : null}
                {verification.decision_reason_internal ? (
                  <div>
                    <p className="text-xs text-text-muted">Catatan internal</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{verification.decision_reason_internal}</p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          <section>
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text">Jejak audit pengajuan</h2>
            </div>
            {auditLogs.length > 0 ? (
              <div className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <div key={log.id} className="grid gap-1 py-3.5 sm:grid-cols-[1fr_170px] sm:gap-6">
                    <div>
                      <p className="text-sm font-medium text-text">{log.action}</p>
                      <p className="mt-0.5 text-xs text-text-secondary-strong">Oleh {log.actor ?? 'sistem'}</p>
                      {log.reason ? <p className="mt-1 text-xs leading-relaxed text-text-muted">{log.reason}</p> : null}
                    </div>
                    <p className="text-xs tabular-nums text-text-muted sm:text-right">{formatDateTime(log.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-sm text-text-secondary-strong">Belum ada jejak audit.</p>
            )}
          </section>
        </div>

        <aside>
          <form onSubmit={submit} className="rounded-[12px] border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-text">Keputusan verifikasi</h2>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                Sponsor akan menerima notifikasi beserta alasan publik yang Anda tulis.
              </p>
            </div>
            <div className="space-y-5 px-5 py-5">
              <Field label="Keputusan" htmlFor="decision" error={errors.decision} required>
                <Select id="decision" value={data.decision} onChange={(event) => setData('decision', event.target.value)} error={errors.decision}>
                  {allowed.includes('under_review') ? <option value="under_review">Tandai sedang ditinjau</option> : null}
                  {allowed.includes('approved') ? <option value="approved">{verification.status === 'suspended' ? 'Aktifkan kembali' : 'Setujui'}</option> : null}
                  {allowed.includes('needs_information') ? <option value="needs_information">Minta informasi tambahan</option> : null}
                  {allowed.includes('rejected') ? <option value="rejected">Tolak</option> : null}
                  {allowed.includes('suspended') ? <option value="suspended">Tangguhkan akun</option> : null}
                </Select>
              </Field>
              <Field
                label="Alasan publik"
                htmlFor="reason_public"
                error={errors.reason_public}
                hint={needsPublicReason ? 'Wajib' : 'Opsional'}
                required={needsPublicReason}
              >
                <Textarea
                  id="reason_public"
                  value={data.reason_public}
                  onChange={(event) => setData('reason_public', event.target.value)}
                  error={errors.reason_public}
                  placeholder={needsPublicReason ? 'Tuliskan apa yang perlu diperbaiki atau alasan penolakan.' : 'Pesan yang akan dibaca sponsor.'}
                />
              </Field>
              <Field label="Catatan internal" htmlFor="reason_internal" error={errors.reason_internal} hint="Tidak ditampilkan ke sponsor">
                <Textarea
                  id="reason_internal"
                  value={data.reason_internal}
                  onChange={(event) => setData('reason_internal', event.target.value)}
                  error={errors.reason_internal}
                  placeholder="Catatan untuk tim operasional."
                />
              </Field>
              {isFinal ? (
                <div className="flex items-start gap-2 rounded-[8px] border border-warning/30 bg-warning/10 px-3 py-2.5">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-strong" aria-hidden="true" />
                  <p className="text-xs leading-relaxed text-warning-strong">
                    Pengajuan ini sudah memiliki keputusan. Keputusan baru akan menggantikan status sebelumnya dan tercatat pada audit log.
                  </p>
                </div>
              ) : null}
              {allowed.length === 0 ? (
                <p className="text-xs leading-relaxed text-text-secondary-strong">
                  Tidak ada keputusan yang tersedia pada status ini. Sponsor perlu mengirim pengajuan terlebih dahulu.
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                variant={['rejected', 'suspended'].includes(data.decision) ? 'destructive' : 'primary'}
                loading={processing}
                disabled={allowed.length === 0}
              >
                {data.decision === 'rejected' ? 'Tolak pengajuan' : 'Simpan keputusan'}
              </Button>
            </div>
          </form>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmingReject}
        title="Tolak pengajuan verifikasi?"
        description="Status sponsor akan menjadi ditolak dan alasan publik yang Anda tulis akan dikirim ke sponsor. Tindakan ini tercatat pada audit log."
        confirmLabel="Ya, tolak pengajuan"
        onConfirm={() => {
          setConfirmingReject(false);
          persist();
        }}
        onCancel={() => setConfirmingReject(false)}
        processing={processing}
      />
    </DashboardLayout>
  );
}
