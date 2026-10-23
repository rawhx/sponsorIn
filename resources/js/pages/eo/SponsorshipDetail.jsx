import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, Handshake, MapPin, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Textarea } from '../../components/Form';
import { formatDate } from '../../lib/utils';

export default function SponsorshipDetail({ sponsorship }) {
  const { flash } = usePage().props;
  const requestForm = useForm({});
  const confirmForm = useForm({});
  const disputeForm = useForm({ reason: '' });

  const isSponsor = sponsorship.role === 'sponsor';
  const s = sponsorship;

  return (
    <DashboardLayout
      eyebrow="Kerja Sama"
      title={s.event.title}
      actions={
        <Link href="/eo/sponsorships" className={buttonClasses({ variant: 'ghost' })}>
          Kembali ke daftar
        </Link>
      }
    >
      <Head title={s.event.title} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-[12px] border border-border bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-medium text-text">{s.sponsor}</p>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-secondary-strong">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(s.event.date_start)}{s.event.date_end && s.event.date_end !== s.event.date_start ? ` – ${formatDate(s.event.date_end)}` : ''}
                  </span>
                  {s.event.location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {s.event.location}
                    </span>
                  ) : null}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div className="space-y-5 px-5 py-5">
              <div>
                <h2 className="text-sm font-semibold text-text">Ringkasan kesepakatan</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary-strong">
                  {s.agreed_terms || 'Tidak ada ringkasan tercatat.'}
                </p>
              </div>
              {s.deliverables ? (
                <div>
                  <h2 className="text-sm font-semibold text-text">Deliverables</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary-strong">{s.deliverables}</p>
                </div>
              ) : null}
            </div>
          </section>

          {s.review ? (
            <section className="rounded-[12px] border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-text">Ulasan sponsor</h2>
              </div>
              <div className="px-5 py-5 space-y-3">
                <div className="flex items-center gap-4 text-xs text-text-secondary-strong">
                  <span>Keseluruhan {s.review.overall_rating}/5</span>
                  <span>Komunikasi {s.review.communication_rating}/5</span>
                  <span>Profesionalisme {s.review.professionalism_rating}/5</span>
                  <span>Deliverables {s.review.deliverables_rating}/5</span>
                </div>
                {s.review.comment ? <p className="text-sm text-text-secondary-strong whitespace-pre-wrap">{s.review.comment}</p> : null}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Tindakan</h2>
            <div className="mt-4 space-y-2">
              {s.status === 'active' && !isSponsor ? (
                <button
                  type="button"
                  onClick={() => requestForm.post(`/eo/sponsorships/${s.id}/request-completion`, { preserveScroll: true })}
                  className={buttonClasses({ className: 'w-full justify-center' })}
                  disabled={requestForm.processing}
                >
                  Minta penyelesaian
                </button>
              ) : null}
              {s.status === 'completion_requested' ? (
                <>
                  <button
                    type="button"
                    onClick={() => confirmForm.post(`/eo/sponsorships/${s.id}/confirm-completion`, { preserveScroll: true })}
                    className={buttonClasses({ className: 'w-full justify-center' })}
                    disabled={confirmForm.processing}
                  >
                    Konfirmasi selesai
                  </button>
                  <form onSubmit={(e) => { e.preventDefault(); disputeForm.post(`/eo/sponsorships/${s.id}/dispute`, { preserveScroll: true }); }} className="space-y-2">
                    <Field label="Alasan sengketa">
                      <Textarea value={disputeForm.data.reason} onChange={(e) => disputeForm.setData('reason', e.target.value)} rows={3} required />
                    </Field>
                    <button type="submit" className={buttonClasses({ variant: 'outline', className: 'w-full justify-center' })} disabled={disputeForm.processing}>
                      Ajukan sengketa
                    </button>
                  </form>
                </>
              ) : null}
              {s.status === 'needs_admin_review' ? (
                <p className="text-xs text-text-secondary-strong">Menunggu peninjauan admin (7 hari tanpa respons).</p>
              ) : null}
              {s.status === 'disputed' ? (
                <p className="text-xs text-text-secondary-strong">Dalam sengketa. Menunggu peninjauan admin.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Info</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Pihak</dt>
                <dd className="text-text-secondary-strong">{s.sponsor} × {s.eo}</dd>
              </div>
              {s.accepted_at ? (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Disetujui</dt>
                  <dd className="text-text-secondary-strong">{formatDate(s.accepted_at)}</dd>
                </div>
              ) : null}
              {s.completed_at ? (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Selesai</dt>
                  <dd className="text-text-secondary-strong">{formatDate(s.completed_at)}</dd>
                </div>
              ) : null}
            </dl>
            {s.proposal_id ? (
              <Link href={`/eo/proposals/${s.proposal_id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary-strong">
                <MessageSquare className="h-3.5 w-3.5" />
                Lihat proposal
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
