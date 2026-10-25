import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, Handshake, MapPin, MessageSquare, Star } from 'lucide-react';
import CancelSponsorshipForm from '../../components/sponsorships/CancelSponsorshipForm';
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
  const reviewForm = useForm({
    overall_rating: 5,
    communication_rating: 5,
    professionalism_rating: 5,
    deliverables_rating: 5,
    comment: '',
  });

  const isSponsor = sponsorship.role === 'sponsor';
  const s = sponsorship;

  function submitReview(e) {
    e.preventDefault();
    if (s.review) {
      reviewForm.put(`/sponsor/sponsorships/${s.id}/review`, { preserveScroll: true });
    } else {
      reviewForm.post(`/sponsor/sponsorships/${s.id}/review`, { preserveScroll: true });
    }
  }

  return (
    <DashboardLayout
      eyebrow="Kerja Sama"
      title={s.event.title}
      actions={
        <Link href="/sponsor/sponsorships" className={buttonClasses({ variant: 'ghost' })}>
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
                <p className="text-sm font-medium text-text">{s.eo}</p>
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

          {s.status === 'completed' && isSponsor && !s.review ? (
            <section className="rounded-[12px] border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-text">Beri rating ke EO</h2>
                <p className="mt-1 text-xs text-text-secondary-strong">Ulasan publik, dapat diedit dalam 24 jam.</p>
              </div>
              <form onSubmit={submitReview} className="space-y-4 px-5 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[['overall_rating','Keseluruhan'],['communication_rating','Komunikasi'],['professionalism_rating','Profesionalisme'],['deliverables_rating','Deliverables']].map(([name,label]) => (
                    <Field key={name} label={label}>
                      <select
                        value={reviewForm.data[name]}
                        onChange={(e) => reviewForm.setData(name, Number(e.target.value))}
                        className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-sm text-text"
                      >
                        {[5,4,3,2,1].map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </Field>
                  ))}
                </div>
                <Field label="Komentar (opsional)">
                  <Textarea value={reviewForm.data.comment} onChange={(e) => reviewForm.setData('comment', e.target.value)} rows={4} />
                </Field>
                <button type="submit" className={buttonClasses()} disabled={reviewForm.processing}>Kirim ulasan</button>
              </form>
            </section>
          ) : null}

          {s.review ? (
            <section className="rounded-[12px] border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-text">Ulasan Anda</h2>
                {s.can_edit_review ? (
                  <span className="text-xs text-text-muted">Dapat diedit dalam 24 jam</span>
                ) : null}
              </div>
              <div className="px-5 py-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-text">
                  <Star className="h-4 w-4" />
                  <span>{s.review.overall_rating}/5</span>
                </div>
                {s.review.comment ? <p className="text-sm text-text-secondary-strong whitespace-pre-wrap">{s.review.comment}</p> : null}
              </div>
              {s.can_edit_review && isSponsor ? (
                <form onSubmit={submitReview} className="border-t border-border space-y-4 px-5 py-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[['overall_rating','Keseluruhan'],['communication_rating','Komunikasi'],['professionalism_rating','Profesionalisme'],['deliverables_rating','Deliverables']].map(([name,label]) => (
                      <Field key={name} label={label}>
                        <select
                          value={reviewForm.data[name]}
                          onChange={(e) => reviewForm.setData(name, Number(e.target.value))}
                          className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-sm text-text"
                        >
                          {[5,4,3,2,1].map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </Field>
                    ))}
                  </div>
                  <Field label="Komentar (opsional)">
                    <Textarea value={reviewForm.data.comment} onChange={(e) => reviewForm.setData('comment', e.target.value)} rows={4} />
                  </Field>
                  <button type="submit" className={buttonClasses()} disabled={reviewForm.processing}>Perbarui ulasan</button>
                </form>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[12px] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text">Tindakan</h2>
            <div className="mt-4 space-y-2">
              {s.status === 'active' && isSponsor ? (
                <button
                  type="button"
                  onClick={() => requestForm.post(`/sponsor/sponsorships/${s.id}/request-completion`, { preserveScroll: true })}
                  className={buttonClasses({ className: 'w-full justify-center' })}
                  disabled={requestForm.processing}
                >
                  Minta penyelesaian
                </button>
              ) : null}
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
              {s.status === 'active' ? <CancelSponsorshipForm action={`/${isSponsor ? 'sponsor' : 'eo'}/sponsorships/${s.id}/cancel`} /> : null}
              {s.status === 'completion_requested' ? (
                <>
                  <button
                    type="button"
                    onClick={() => confirmForm.post(`/${isSponsor ? 'sponsor' : 'eo'}/sponsorships/${s.id}/confirm-completion`, { preserveScroll: true })}
                    className={buttonClasses({ className: 'w-full justify-center' })}
                    disabled={confirmForm.processing}
                  >
                    Konfirmasi selesai
                  </button>
                  <form onSubmit={(e) => { e.preventDefault(); disputeForm.post(`/${isSponsor ? 'sponsor' : 'eo'}/sponsorships/${s.id}/dispute`, { preserveScroll: true }); }} className="space-y-2">
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
              {s.cancellation_reason ? (
                <p className="text-xs leading-relaxed text-text-secondary-strong">Alasan pembatalan: {s.cancellation_reason}</p>
              ) : null}
              {s.admin_resolution_note ? (
                <p className="text-xs leading-relaxed text-text-secondary-strong">Keputusan admin: {s.admin_resolution_note}</p>
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
              <div className="flex justify-between">
                <dt className="text-text-muted">Status</dt>
                <dd className="text-text-secondary-strong">{s.status}</dd>
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
              <Link href={isSponsor ? `/sponsor/proposals/${s.proposal_id}` : `/eo/proposals/${s.proposal_id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary-strong">
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
