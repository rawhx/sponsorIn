import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, MapPin, MessageSquare, Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import { Field, Select, Textarea } from '../../components/Form';
import { formatDate } from '../../lib/utils';
import SponsorshipChat from '../../components/sponsorships/SponsorshipChat';

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
      eyebrow="Kerja Sama Sponsorship"
      title={s.event.title}
      actions={
        <Link href="/sponsor/sponsorships" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft className="h-4 w-4" />
          Daftar Kerja Sama
        </Link>
      }
    >
      <Head title={`Kerja Sama · ${s.event.title}`} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Column */}
        <div className="min-w-0 space-y-6">
          {/* Header & Agreed Terms Card */}
          <section className="rounded-2xl border border-border/80 bg-surface shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 p-5 sm:p-6">
              <div>
                <p className="text-sm font-semibold text-text">Penyelenggara: {s.eo}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" />
                    {formatDate(s.event.date_start)}{s.event.date_end && s.event.date_end !== s.event.date_start ? ` – ${formatDate(s.event.date_end)}` : ''}
                  </span>
                  {s.event.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-text-muted" />
                      {s.event.location}
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Ringkasan Kesepakatan</h2>
                <div className="mt-2 rounded-xl bg-background/60 p-4 border border-border/60">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                    {s.agreed_terms || 'Tidak ada ringkasan kesepakatan tercatat.'}
                  </p>
                </div>
              </div>

              {s.deliverables && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Deliverables Disepakati</h2>
                  <div className="mt-2 rounded-xl bg-background/60 p-4 border border-border/60">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                      {s.deliverables}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Chat Component */}
          <SponsorshipChat sponsorship={s} basePath="/sponsor/sponsorships" />

          {/* Review Submission Section (if completed and no review yet) */}
          {s.status === 'completed' && isSponsor && !s.review && (
            <section className="rounded-2xl border border-border/80 bg-surface shadow-xs">
              <div className="border-b border-border/70 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-text">Beri Rating & Ulasan untuk EO</h2>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Ulasan ini akan tampil di profil publik organizer. Anda dapat mengubahnya dalam waktu 24 jam.
                </p>
              </div>

              <form onSubmit={submitReview} className="space-y-4 p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['overall_rating', 'Rating Keseluruhan'],
                    ['communication_rating', 'Kualitas Komunikasi'],
                    ['professionalism_rating', 'Tingkat Profesionalisme'],
                    ['deliverables_rating', 'Realisasi Deliverable'],
                  ].map(([name, label]) => (
                    <Field key={name} label={label}>
                      <Select
                        value={reviewForm.data[name]}
                        onChange={(e) => reviewForm.setData(name, Number(e.target.value))}
                      >
                        {[5, 4, 3, 2, 1].map((v) => (
                          <option key={v} value={v}>
                            {v} Bintang {v === 5 ? '(Sangat Puas)' : v === 4 ? '(Puas)' : v === 3 ? '(Cukup)' : v === 2 ? '(Kurang)' : '(Sangat Buruk)'}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  ))}
                </div>

                <Field label="Ulasan Tambahan (opsional)" htmlFor="comment">
                  <Textarea
                    id="comment"
                    value={reviewForm.data.comment}
                    onChange={(e) => reviewForm.setData('comment', e.target.value)}
                    rows={4}
                    placeholder="Ceritakan pengalaman kerja sama Anda bersama pihak EO…"
                  />
                </Field>

                <Button type="submit" loading={reviewForm.processing}>
                  Kirim Ulasan
                </Button>
              </form>
            </section>
          )}

          {/* Existing Review Display & Edit */}
          {s.review && (
            <section className="rounded-2xl border border-border/80 bg-surface shadow-xs">
              <div className="flex items-center justify-between border-b border-border/70 p-5 sm:p-6">
                <div>
                  <h2 className="text-base font-semibold text-text">Ulasan Anda</h2>
                  <p className="mt-0.5 text-xs text-text-secondary">Ulasan publik yang telah dikirim</p>
                </div>
                {s.can_edit_review && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Dapat diedit (24 jam)
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-text">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  <span>{s.review.overall_rating} dari 5 Bintang</span>
                </div>
                {s.review.comment && (
                  <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap rounded-xl bg-background/50 p-4 border border-border/50">
                    {s.review.comment}
                  </p>
                )}
              </div>

              {s.can_edit_review && isSponsor && (
                <form onSubmit={submitReview} className="border-t border-border/70 p-5 sm:p-6 space-y-4 bg-background/30 rounded-b-2xl">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Perbarui Ulasan</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ['overall_rating', 'Rating Keseluruhan'],
                      ['communication_rating', 'Kualitas Komunikasi'],
                      ['professionalism_rating', 'Tingkat Profesionalisme'],
                      ['deliverables_rating', 'Realisasi Deliverable'],
                    ].map(([name, label]) => (
                      <Field key={name} label={label}>
                        <Select
                          value={reviewForm.data[name]}
                          onChange={(e) => reviewForm.setData(name, Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map((v) => (
                            <option key={v} value={v}>{v} Bintang</option>
                          ))}
                        </Select>
                      </Field>
                    ))}
                  </div>

                  <Field label="Komentar (opsional)">
                    <Textarea
                      value={reviewForm.data.comment}
                      onChange={(e) => reviewForm.setData('comment', e.target.value)}
                      rows={3}
                    />
                  </Field>

                  <Button type="submit" size="sm" loading={reviewForm.processing}>
                    Perbarui Ulasan
                  </Button>
                </form>
              )}
            </section>
          )}
        </div>

        {/* Aside Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Actions Card */}
          <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Aksi Kerja Sama</h2>
            <div className="mt-4 space-y-3">
              {s.status === 'active' && (
                <Button
                  type="button"
                  onClick={() => requestForm.post(`/${isSponsor ? 'sponsor' : 'eo'}/sponsorships/${s.id}/request-completion`, { preserveScroll: true })}
                  className="w-full justify-center"
                  loading={requestForm.processing}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Minta Penyelesaian
                </Button>
              )}

              {s.status === 'completion_requested' && (
                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={() => confirmForm.post(`/${isSponsor ? 'sponsor' : 'eo'}/sponsorships/${s.id}/confirm-completion`, { preserveScroll: true })}
                    className="w-full justify-center"
                    loading={confirmForm.processing}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Konfirmasi Selesai
                  </Button>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      disputeForm.post(`/${isSponsor ? 'sponsor' : 'eo'}/sponsorships/${s.id}/dispute`, { preserveScroll: true });
                    }}
                    className="space-y-2 pt-2 border-t border-border/60"
                  >
                    <Field label="Ajukan Sengketa" htmlFor="dispute_reason">
                      <Textarea
                        id="dispute_reason"
                        value={disputeForm.data.reason}
                        onChange={(e) => disputeForm.setData('reason', e.target.value)}
                        rows={3}
                        placeholder="Jelaskan alasan deliverable belum terpenuhi…"
                        required
                      />
                    </Field>
                    <Button
                      type="submit"
                      variant="destructive-outline"
                      className="w-full justify-center"
                      loading={disputeForm.processing}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Ajukan Sengketa
                    </Button>
                  </form>
                </div>
              )}

              {s.status === 'needs_admin_review' && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs text-warning-strong">
                  Menunggu peninjauan admin karena tidak ada respons selama 7 hari kerja.
                </div>
              )}

              {s.status === 'disputed' && (
                <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-xs text-danger-strong">
                  Status dalam sengketa. Tim operasional admin sedang memediasi kedua pihak.
                </div>
              )}
            </div>
          </div>

          {/* Dossier Meta Info Card */}
          <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Informasi Kontrak</h2>
            <dl className="mt-4 divide-y divide-border/60 text-xs">
              <div className="flex justify-between py-2.5">
                <dt className="text-text-secondary">Pihak Terkait</dt>
                <dd className="font-medium text-text text-right">{s.sponsor} & {s.eo}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-text-secondary">Status</dt>
                <dd><StatusBadge status={s.status} /></dd>
              </div>
              {s.accepted_at && (
                <div className="flex justify-between py-2.5">
                  <dt className="text-text-secondary">Disetujui</dt>
                  <dd className="tabular-nums font-medium text-text">{formatDate(s.accepted_at)}</dd>
                </div>
              )}
              {s.completed_at && (
                <div className="flex justify-between py-2.5">
                  <dt className="text-text-secondary">Selesai</dt>
                  <dd className="tabular-nums font-medium text-text">{formatDate(s.completed_at)}</dd>
                </div>
              )}
            </dl>

            {s.proposal_id && (
              <div className="mt-4 pt-3 border-t border-border/60">
                <Link
                  href={isSponsor ? `/sponsor/proposals/${s.proposal_id}` : `/eo/proposals/${s.proposal_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-strong transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Lihat Riwayat Proposal
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
