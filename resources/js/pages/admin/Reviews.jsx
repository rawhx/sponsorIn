import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import Button, { buttonClasses } from '../../components/Button';
import { Field, Textarea } from '../../components/Form';
import { formatDate } from '../../lib/utils';

function formatDateTime(value) {
  if (!value) return '—';
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Reviews({ reviews, filters, counts }) {
  const hideForm = useForm({ reason: '' });
  const restoreForm = useForm({});

  return (
    <DashboardLayout
      eyebrow="Moderasi platform"
      title="Moderasi Ulasan & Rating"
      description="Tinjau ulasan publik dari sponsor kepada EO. Sembunyikan ulasan yang melanggar ketentuan komunitas."
      actions={null}
    >
      <Head title="Moderasi Ulasan" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
        {/* Main Column */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4 border-b border-border/80 pb-3">
            <p className="text-sm text-text-secondary">
              Total <span className="font-semibold text-text tabular-nums">{reviews.total}</span> ulasan tercatat
            </p>
            <p className="text-xs text-text-muted">Status: Diterbitkan / Disembunyikan</p>
          </div>

          {reviews.data.length > 0 ? (
            <div className="mt-4 space-y-4">
              {reviews.data.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs space-y-3.5 transition-all hover:border-primary/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-text">{review.event_title}</h3>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        EO: <strong className="font-medium text-text">{review.eo}</strong> · Sponsor:{' '}
                        <strong className="font-medium text-text">{review.sponsor}</strong>
                      </p>
                      <p className="mt-0.5 text-[11px] tabular-nums text-text-muted">
                        Dikirim pada {formatDateTime(review.submitted_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        <span>{review.overall_rating} / 5</span>
                      </div>
                      <StatusBadge status={review.status} />
                    </div>
                  </div>

                  {review.comment && (
                    <div className="rounded-xl bg-background/60 p-4 border border-border/50">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                        {review.comment}
                      </p>
                    </div>
                  )}

                  {review.status === 'published' ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        hideForm.post(`/admin/reviews/${review.id}/hide`, { preserveScroll: true });
                      }}
                      className="flex flex-col sm:flex-row sm:items-end gap-3 pt-2 border-t border-border/50"
                    >
                      <Field label="Alasan Sembunyikan Ulasan" className="flex-1">
                        <Textarea
                          value={hideForm.data.reason}
                          onChange={(e) => hideForm.setData('reason', e.target.value)}
                          rows={2}
                          placeholder="Misal: Mengandung ujaran kebencian, pencemaran nama baik, atau spam…"
                          required
                        />
                      </Field>
                      <Button
                        type="submit"
                        variant="destructive-outline"
                        size="sm"
                        loading={hideForm.processing}
                        className="shrink-0"
                      >
                        <EyeOff className="h-4 w-4" />
                        Sembunyikan Ulasan
                      </Button>
                    </form>
                  ) : null}

                  {review.status === 'hidden' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
                      <div className="text-danger-strong">
                        <span className="font-semibold">Ulasan disembunyikan.</span> Alasan: {review.hidden_reason || 'Pelanggaran ketentuan.'}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => restoreForm.post(`/admin/reviews/${review.id}/restore`, { preserveScroll: true })}
                        loading={restoreForm.processing}
                      >
                        <Eye className="h-4 w-4" />
                        Tampilkan Kembali
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4">
                <Pagination paginator={reviews} />
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                illustration="message"
                title="Belum ada ulasan yang masuk"
                description="Ulasan sponsorship yang ditulis oleh pihak sponsor akan terdaftar di sini untuk dipantau integritasnya."
              />
            </div>
          )}
        </div>

        {/* Aside Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Ketentuan Ulasan Publik</h2>
            <ul className="space-y-2.5 text-xs text-text-secondary leading-relaxed divide-y divide-border/40">
              <li className="pt-2">Ulasan hanya dapat diterbitkan setelah kedua belah pihak menandai kerja sama sponsorship selesai.</li>
              <li className="pt-2">Sponsor memiliki waktu edit maksimal 24 jam setelah pengiriman ulasan pertama.</li>
              <li className="pt-2">Admin berhak menyembunyikan ulasan yang melanggar norma hukum, mengandung SARA, atau promosi tidak relevan.</li>
            </ul>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
