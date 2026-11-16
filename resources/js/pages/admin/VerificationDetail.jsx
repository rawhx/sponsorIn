import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Download, History, ShieldAlert } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
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
  const { data, setData, post, processing, errors } = useForm({
    decision: 'approved',
    reason_internal: '',
    reason_public: '',
  });

  const [confirmingReject, setConfirmingReject] = useState(false);
  const needsPublicReason = data.decision === 'needs_information' || data.decision === 'rejected';

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
      actions={
        <div className="flex items-center gap-3">
          <StatusBadge status={verification.status} />
          <Link href="/admin/verifications" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      }
    >
      <Head title={`Verifikasi · ${verification.organization_name}`} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main Column */}
        <div className="min-w-0 space-y-6">
          {/* Legal Data Section */}
          <section className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
            <div className="border-b border-border/70 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-text">Data Pengajuan Sponsor</h2>
              <p className="mt-0.5 text-xs text-text-secondary">Informasi badan usaha terverifikasi dari dokumen resmi</p>
            </div>
            <dl className="divide-y divide-border/60 text-xs">
              {[
                ['Nama Badan Usaha', verification.legal_name],
                ['Nama Kontak / Pemohon', verification.contact_name],
                ['Email Akun', verification.contact_email],
                ['Email Usaha Resmi', verification.business_email ?? '—'],
                ['Bentuk Badan Hukum', legalFormLabels[verification.legal_form] ?? verification.legal_form ?? '—'],
                ['NIB (Nomor Induk Berusaha)', verification.nib ?? '—'],
                ['NPWP Badan Usaha', verification.tax_id ?? '—'],
                ['Tanggal Diajukan', formatDateTime(verification.submitted_at)],
                ['Tanggal Ditinjau', formatDateTime(verification.reviewed_at)],
                ['Admin Peninjau', verification.reviewer_name ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:px-6">
                  <dt className="text-text-muted">{label}</dt>
                  <dd className="break-words font-medium text-text">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-border/70 p-5 sm:px-6 bg-background/40">
              {verification.has_document ? (
                <a
                  href={`/admin/verifications/${verification.id}/document`}
                  className={buttonClasses({ size: 'sm', className: 'gap-2' })}
                >
                  <Download className="h-4 w-4" />
                  Unduh Dokumen Legal Pendukung
                </a>
              ) : (
                <p className="text-xs text-text-muted">Tidak ada dokumen pendukung yang diunggah.</p>
              )}
            </div>
          </section>

          {/* Previous Decision Notes (if any) */}
          {(verification.decision_reason_internal || verification.decision_reason_public) && (
            <section className="rounded-2xl border border-border/80 bg-surface shadow-xs p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-semibold text-text">Catatan Keputusan Sebelumnya</h2>
              {verification.decision_reason_public && (
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Alasan Publik (Dikirim ke Sponsor)</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{verification.decision_reason_public}</p>
                </div>
              )}
              {verification.decision_reason_internal && (
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Catatan Internal Admin</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{verification.decision_reason_internal}</p>
                </div>
              )}
            </section>
          )}

          {/* Audit Logs Trail */}
          <section className="rounded-2xl border border-border/80 bg-surface shadow-xs p-5 sm:p-6">
            <div className="flex items-center gap-2 border-b border-border/70 pb-4">
              <History className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-text">Jejak Audit Verifikasi</h2>
            </div>
            {auditLogs.length > 0 ? (
              <div className="mt-4 divide-y divide-border/60">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="font-semibold text-text">{log.action}</p>
                      <span className="tabular-nums text-text-muted text-[11px]">{formatDateTime(log.created_at)}</span>
                    </div>
                    <p className="mt-0.5 text-text-secondary">Oleh: <strong className="font-medium text-text">{log.actor ?? 'Sistem'}</strong></p>
                    {log.reason && <p className="mt-1 rounded bg-background p-2 text-text-muted">{log.reason}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-text-secondary">Belum ada riwayat audit log tercatat.</p>
            )}
          </section>
        </div>

        {/* Aside Sidebar: Decision Form */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={submit} className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6 space-y-5">
            <div className="border-b border-border/70 pb-4">
              <h2 className="text-base font-semibold text-text">Formulir Keputusan</h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                Sponsor akan menerima notifikasi email sesuai status dan alasan yang Anda tentukan.
              </p>
            </div>

            <Field label="Keputusan Verifikasi" htmlFor="decision" error={errors.decision} required>
              <Select id="decision" value={data.decision} onChange={(event) => setData('decision', event.target.value)} error={errors.decision}>
                <option value="approved">Setujui Verifikasi</option>
                <option value="needs_information">Minta Informasi Tambahan</option>
                <option value="rejected">Tolak Pengajuan</option>
              </Select>
            </Field>

            <Field
              label="Alasan Publik (ke Sponsor)"
              htmlFor="reason_public"
              error={errors.reason_public}
              hint={needsPublicReason ? 'Wajib diisi' : 'Opsional'}
              required={needsPublicReason}
            >
              <Textarea
                id="reason_public"
                value={data.reason_public}
                onChange={(event) => setData('reason_public', event.target.value)}
                error={errors.reason_public}
                rows={4}
                placeholder={needsPublicReason ? 'Jelaskan kekurangan dokumen atau alasan penolakan secara jelas…' : 'Catatan apresiasi untuk sponsor…'}
              />
            </Field>

            <Field label="Catatan Internal Admin" htmlFor="reason_internal" error={errors.reason_internal} hint="Hanya terlihat oleh tim admin">
              <Textarea
                id="reason_internal"
                value={data.reason_internal}
                onChange={(event) => setData('reason_internal', event.target.value)}
                error={errors.reason_internal}
                rows={3}
                placeholder="Catatan tambahan untuk tim verifikator lain…"
              />
            </Field>

            {isFinal && (
              <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning-strong">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Pengajuan ini telah memiliki keputusan final. Keputusan baru akan menimpa status sebelumnya dan dicatat di log audit.</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              variant={data.decision === 'rejected' ? 'destructive' : 'primary'}
              loading={processing}
            >
              {data.decision === 'rejected' ? 'Tolak Pengajuan' : 'Simpan Keputusan'}
            </Button>
          </form>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmingReject}
        title="Tolak Pengajuan Verifikasi?"
        description="Pengajuan sponsor ini akan ditandai ditolak dan alasan publik akan dikirimkan kepada pemohon. Keputusan ini tercatat di jejak audit permanen."
        confirmLabel="Ya, Tolak Pengajuan"
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
