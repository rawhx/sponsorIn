import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, BadgeCheck, Building2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge, { EvidenceTag } from '../../components/StatusBadge';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, Select, Textarea } from '../../components/Form';
import { evidenceTypeLabels, formatCurrency, formatDateRange, formatNumber, supportTypeLabels } from '../../lib/utils';

export default function AdminEventDetail({ event }) {
  const allowed = event.allowed_decisions ?? [];
  const { data, setData, post, processing, errors } = useForm({
    decision: allowed[0] ?? '',
    reason_internal: '',
    reason_public: '',
  });

  const [confirmingDestructive, setConfirmingDestructive] = useState(false);
  const needsPublicReason = ['needs_changes', 'rejected', 'unpublished'].includes(data.decision);
  const isDestructive = ['rejected', 'unpublished'].includes(data.decision);

  function persist() {
    post(`/admin/events/${event.id}/decision`, { preserveScroll: true });
  }

  function submit(submitEvent) {
    submitEvent.preventDefault();
    if (isDestructive) {
      setConfirmingDestructive(true);
      return;
    }
    persist();
  }

  return (
    <DashboardLayout
      eyebrow={event.organizer.name}
      title={event.title}
      actions={<StatusBadge status={event.status} />}
    >
      <Head title={`Moderasi · ${event.title}`} />

      <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-text-secondary-strong hover:text-text">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke antrean moderasi
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <div className="min-w-0 space-y-6">
          <section className="rounded-[12px] border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-border bg-background-muted">
                <Building2 className="h-5 w-5 text-primary-strong" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-text">{event.organizer.name}</p>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs">
                  {event.organizer.verified ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5 text-success-strong" aria-hidden="true" />
                      <span className="text-success-strong">EO terverifikasi</span>
                    </>
                  ) : (
                    <span className="text-text-secondary-strong">EO belum terverifikasi</span>
                  )}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-sm text-text-secondary-strong">
              <span>{formatDateRange(event.date_start, event.date_end)}</span>
              <span>{event.location}</span>
              <EvidenceTag tone="primary">{event.category}</EvidenceTag>
              <EvidenceTag>{event.format}</EvidenceTag>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-secondary-strong">{event.description}</p>
            {event.audience_profile ? (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs text-text-muted">Profil audiens</p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{event.audience_profile}</p>
              </div>
            ) : null}
            {event.support_needs ? (
              <div className="mt-3">
                <p className="text-xs text-text-muted">Kebutuhan dukungan</p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{event.support_needs}</p>
              </div>
            ) : null}
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text">Bukti audiens</h2>
              <p className="text-xs text-text-muted">{event.evidence.length} bukti</p>
            </div>
            {event.evidence.length > 0 ? (
              <div className="divide-y divide-border">
                {event.evidence.map((item) => (
                  <div key={item.id} className="grid gap-2 py-3.5 sm:grid-cols-[140px_1fr_auto] sm:items-start sm:gap-4">
                    <div>
                      <p className="text-xs font-medium text-text">{evidenceTypeLabels[item.type] ?? item.type}</p>
                      <p className="mt-0.5 text-[11px] text-text-muted">{item.period}</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold tabular-nums text-text">
                        {formatNumber(item.value)} <span className="text-sm font-normal text-text-secondary-strong">{item.unit}</span>
                      </p>
                      <p className="mt-1 text-xs text-text-secondary-strong">Sumber: {item.source || 'Tidak disebutkan'}</p>
                      {item.note ? <p className="mt-0.5 text-xs text-text-muted">{item.note}</p> : null}
                    </div>
                    <StatusBadge status={item.verification_status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-[10px] border border-dashed border-border px-4 py-4 text-sm text-text-secondary-strong">
                Event ini tidak menyertakan bukti audiens.
              </p>
            )}
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text">Paket sponsorship</h2>
              <p className="text-xs text-text-muted">{event.packages.length} paket</p>
            </div>
            {event.packages.length > 0 ? (
              <div className="divide-y divide-border">
                {event.packages.map((pkg) => (
                  <div key={pkg.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[15px] font-semibold text-text">{pkg.name}</h3>
                          <StatusBadge status={pkg.availability_status} />
                        </div>
                        <p className="mt-0.5 text-xs text-text-secondary-strong">{supportTypeLabels[pkg.support_type] ?? pkg.support_type}</p>
                      </div>
                      <p className="text-sm font-medium tabular-nums text-text">
                        {pkg.support_type === 'cash' ? formatCurrency(pkg.price_amount, pkg.currency) : 'Non-tunai'}
                      </p>
                    </div>
                    {Array.isArray(pkg.benefits) && pkg.benefits.length > 0 ? (
                      <p className="mt-2 text-xs leading-relaxed text-text-secondary">Benefit: {pkg.benefits.join(' · ')}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-[10px] border border-dashed border-border px-4 py-4 text-sm text-text-secondary-strong">
                Belum ada paket sponsorship.
              </p>
            )}
          </section>

          {event.moderation_reason_public || event.moderation_reason_internal ? (
            <section className="rounded-[12px] border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-text">Catatan moderasi terakhir</h2>
              {event.moderation_reason_public ? (
                <div className="mt-3">
                  <p className="text-xs text-text-muted">Alasan publik</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{event.moderation_reason_public}</p>
                </div>
              ) : null}
              {event.moderation_reason_internal ? (
                <div className="mt-3">
                  <p className="text-xs text-text-muted">Catatan internal</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary-strong">{event.moderation_reason_internal}</p>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside>
          <form onSubmit={submit} className="rounded-[12px] border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-text">Keputusan moderasi</h2>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary-strong">
                EO akan menerima notifikasi beserta alasan publik yang Anda tulis.
              </p>
            </div>
            <div className="space-y-5 px-5 py-5">
              <Field label="Keputusan" htmlFor="decision" error={errors.decision} required>
                <Select id="decision" value={data.decision} onChange={(e) => setData('decision', e.target.value)} error={errors.decision}>
                  {allowed.includes('approved') ? <option value="approved">Setujui dan terbitkan</option> : null}
                  {allowed.includes('needs_changes') ? <option value="needs_changes">Minta perbaikan</option> : null}
                  {allowed.includes('unpublished') ? <option value="unpublished">Tarik dari publik</option> : null}
                  {allowed.includes('rejected') ? <option value="rejected">Tolak</option> : null}
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
                  onChange={(e) => setData('reason_public', e.target.value)}
                  error={errors.reason_public}
                  placeholder={needsPublicReason ? 'Tuliskan apa yang perlu diperbaiki atau alasan keputusan.' : 'Pesan yang akan dibaca EO.'}
                />
              </Field>
              <Field label="Catatan internal" htmlFor="reason_internal" error={errors.reason_internal} hint="Tidak ditampilkan ke EO">
                <Textarea
                  id="reason_internal"
                  value={data.reason_internal}
                  onChange={(e) => setData('reason_internal', e.target.value)}
                  error={errors.reason_internal}
                  placeholder="Catatan untuk tim operasional."
                />
              </Field>
              {allowed.length === 0 ? (
                <p className="text-xs leading-relaxed text-text-secondary-strong">
                  Tidak ada keputusan moderasi yang tersedia pada status ini. EO perlu mengirim event untuk direview terlebih dahulu.
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                variant={isDestructive ? 'destructive' : 'primary'}
                loading={processing}
                disabled={allowed.length === 0}
              >
                {data.decision === 'rejected'
                  ? 'Tolak event'
                  : data.decision === 'unpublished'
                    ? 'Turunkan event'
                    : 'Simpan keputusan'}
              </Button>
            </div>
          </form>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmingDestructive}
        title={data.decision === 'rejected' ? 'Tolak event ini?' : 'Turunkan event ini?'}
        description={
          data.decision === 'rejected'
            ? 'Event tidak akan tampil publik dan EO menerima alasan yang Anda tulis. Tindakan ini tercatat pada audit log.'
            : 'Event akan ditarik dari halaman publik sampai diperbarui. Alasan yang Anda tulis akan dikirim ke EO.'
        }
        confirmLabel={data.decision === 'rejected' ? 'Ya, tolak event' : 'Ya, turunkan event'}
        onConfirm={() => {
          setConfirmingDestructive(false);
          persist();
        }}
        onCancel={() => setConfirmingDestructive(false)}
        processing={processing}
      />
    </DashboardLayout>
  );
}
