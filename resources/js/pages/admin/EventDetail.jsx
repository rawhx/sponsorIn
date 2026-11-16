import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, MapPin } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge, { EvidenceTag } from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Field, Select, Textarea } from '../../components/Form';
import { evidenceTypeLabels, formatCurrency, formatDateRange, formatEvidencePeriod, formatNumber, supportTypeLabels } from '../../lib/utils';

export default function AdminEventDetail({ event }) {
  const { data, setData, post, processing, errors } = useForm({
    decision: 'approved',
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
      eyebrow={`EO: ${event.organizer.name}`}
      title={event.title}
      actions={
        <div className="flex items-center gap-3">
          <StatusBadge status={event.status} />
          <Link href="/admin/events" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      }
    >
      <Head title={`Moderasi · ${event.title}`} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main Column */}
        <div className="min-w-0 space-y-6">
          {/* Event Overview Card */}
          <section className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3 border-b border-border/70 pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text">{event.organizer.name}</p>
                <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs">
                  {event.organizer.verified ? (
                    <span className="inline-flex items-center gap-1 text-success font-medium">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      EO Terverifikasi
                    </span>
                  ) : (
                    <span className="text-text-secondary">EO Belum Terverifikasi</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                <strong className="font-medium text-text">{formatDateRange(event.date_start, event.date_end)}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-text-muted" />
                <span>{event.location}</span>
              </span>
              <EvidenceTag tone="primary">{event.category}</EvidenceTag>
              {event.format && <EvidenceTag>{event.format}</EvidenceTag>}
            </div>

            <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary pt-2">
              {event.description}
            </p>

            {event.audience_profile && (
              <div className="border-t border-border/60 pt-3 text-xs">
                <p className="font-semibold text-text uppercase tracking-wider text-[11px] text-text-muted">Profil Target Audiens</p>
                <p className="mt-1 leading-relaxed text-text-secondary">{event.audience_profile}</p>
              </div>
            )}

            {event.support_needs && (
              <div className="border-t border-border/60 pt-3 text-xs">
                <p className="font-semibold text-text uppercase tracking-wider text-[11px] text-text-muted">Kebutuhan Dukungan</p>
                <p className="mt-1 leading-relaxed text-text-secondary">{event.support_needs}</p>
              </div>
            )}
          </section>

          {/* Audience Evidence Review */}
          <section className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <h2 className="text-base font-semibold text-text">Bukti Audiens Terlampir</h2>
                <p className="mt-0.5 text-xs text-text-secondary">Verifikasi metrik historis / proyeksi dari EO</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {event.evidence.length} Bukti
              </span>
            </div>

            {event.evidence.length > 0 ? (
              <div className="mt-4 space-y-3">
                {event.evidence.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/50 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text">{evidenceTypeLabels[item.type] ?? item.type}</span>
                        {(item.period_start || item.period) && (
                          <span className="text-[11px] text-text-muted">· {formatEvidencePeriod(item)}</span>
                        )}
                      </div>
                      <p className="mt-1 text-base font-bold tabular-nums text-text">
                        {formatNumber(item.value)} <span className="text-xs font-normal text-text-secondary">{item.unit}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">Sumber: {item.source || 'Tidak dicantumkan'}</p>
                      {item.note && <p className="mt-0.5 text-xs text-text-muted italic">{item.note}</p>}
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={item.verification_status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-text-muted">
                Event ini tidak menyertakan berkas bukti audiens.
              </div>
            )}
          </section>

          {/* Packages Review */}
          <section className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <h2 className="text-base font-semibold text-text">Paket Sponsorship</h2>
                <p className="mt-0.5 text-xs text-text-secondary">Daftar tawaran paket yang dipublikasikan</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {event.packages.length} Paket
              </span>
            </div>

            {event.packages.length > 0 ? (
              <div className="mt-4 space-y-3">
                {event.packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-xl border border-border/70 bg-background/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-text">{pkg.name}</h3>
                          <StatusBadge status={pkg.availability_status} />
                        </div>
                        <p className="mt-0.5 text-xs text-text-secondary">{supportTypeLabels[pkg.support_type] ?? pkg.support_type}</p>
                      </div>
                      <p className="text-sm font-bold tabular-nums text-primary">
                        {pkg.support_type === 'cash' ? formatCurrency(pkg.price_amount, pkg.currency) : 'Dukungan Non-Tunai'}
                      </p>
                    </div>
                    {Array.isArray(pkg.benefits) && pkg.benefits.length > 0 && (
                      <p className="mt-2 text-xs text-text-secondary leading-relaxed border-t border-border/40 pt-2">
                        Benefit: {pkg.benefits.join(' · ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-text-muted">
                Belum ada paket sponsorship yang dibuat untuk event ini.
              </div>
            )}
          </section>

          {/* Last Moderation Notes */}
          {(event.moderation_reason_public || event.moderation_reason_internal) && (
            <section className="rounded-2xl border border-border/80 bg-surface shadow-xs p-5 sm:p-6 space-y-3">
              <h2 className="text-sm font-semibold text-text">Catatan Moderasi Sebelumnya</h2>
              {event.moderation_reason_public && (
                <div className="rounded-xl border border-border/70 bg-background/60 p-4 text-xs">
                  <p className="font-semibold text-text-muted uppercase tracking-wider text-[11px]">Alasan Publik ke EO</p>
                  <p className="mt-1 text-text-secondary leading-relaxed">{event.moderation_reason_public}</p>
                </div>
              )}
              {event.moderation_reason_internal && (
                <div className="rounded-xl border border-border/70 bg-background/60 p-4 text-xs">
                  <p className="font-semibold text-text-muted uppercase tracking-wider text-[11px]">Catatan Internal Admin</p>
                  <p className="mt-1 text-text-secondary leading-relaxed">{event.moderation_reason_internal}</p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Aside Sidebar: Moderation Form */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={submit} className="rounded-2xl border border-border/80 bg-surface shadow-xs p-6 space-y-5">
            <div className="border-b border-border/70 pb-4">
              <h2 className="text-base font-semibold text-text">Keputusan Moderasi</h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                EO akan menerima notifikasi status event dan catatan publik yang Anda tulis.
              </p>
            </div>

            <Field label="Pilihan Keputusan" htmlFor="decision" error={errors.decision} required>
              <Select id="decision" value={data.decision} onChange={(e) => setData('decision', e.target.value)} error={errors.decision}>
                <option value="approved">Setujui & Terbitkan ke Publik</option>
                <option value="needs_changes">Minta Perbaikan Konten</option>
                <option value="unpublished">Tarik dari Tayang Publik</option>
                <option value="rejected">Tolak Event</option>
              </Select>
            </Field>

            <Field
              label="Alasan Publik (ke EO)"
              htmlFor="reason_public"
              error={errors.reason_public}
              hint={needsPublicReason ? 'Wajib diisi' : 'Opsional'}
              required={needsPublicReason}
            >
              <Textarea
                id="reason_public"
                value={data.reason_public}
                onChange={(e) => setData('reason_public', e.target.value)}
                error={errors.reason_public}
                rows={4}
                placeholder={needsPublicReason ? 'Tuliskan poin yang perlu diperbaiki EO atau alasan penolakan…' : 'Catatan apresiasi untuk EO…'}
              />
            </Field>

            <Field label="Catatan Internal Admin" htmlFor="reason_internal" error={errors.reason_internal} hint="Hanya terlihat oleh tim admin">
              <Textarea
                id="reason_internal"
                value={data.reason_internal}
                onChange={(e) => setData('reason_internal', e.target.value)}
                error={errors.reason_internal}
                rows={3}
                placeholder="Catatan tim internal mengenai kelayakan event…"
              />
            </Field>

            <Button
              type="submit"
              className="w-full"
              variant={isDestructive ? 'destructive' : 'primary'}
              loading={processing}
            >
              {data.decision === 'rejected'
                ? 'Tolak Event'
                : data.decision === 'unpublished'
                  ? 'Tarik Event dari Publik'
                  : 'Simpan Keputusan Moderasi'}
            </Button>
          </form>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmingDestructive}
        title={data.decision === 'rejected' ? 'Tolak Event Ini?' : 'Tarik Event Ini dari Publik?'}
        description={
          data.decision === 'rejected'
            ? 'Event tidak akan ditampilkan ke katalog publik dan EO akan menerima pemberitahuan alasan penolakan. Aksi ini dicatat dalam log audit.'
            : 'Event akan disembunyikan sementara dari katalog publik hingga diperbaiki oleh EO. Alasan penarikan akan dikirim ke EO.'
        }
        confirmLabel={data.decision === 'rejected' ? 'Ya, Tolak Event' : 'Ya, Tarik Event'}
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
