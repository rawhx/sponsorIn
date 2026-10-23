import { Head, Link, useForm } from '@inertiajs/react';
import { Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
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
      eyebrow="Moderasi"
      title="Ulasan"
      actions={null}
    >
      <Head title="Ulasan" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <p className="text-sm text-text-secondary-strong">
              <span className="font-medium tabular-nums text-text">{reviews.total}</span> ulasan
            </p>
            <p className="text-xs text-text-muted">Diterbitkan / disembunyikan</p>
          </div>

          {reviews.data.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {reviews.data.map((review) => (
                  <div key={review.id} className="py-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-text">{review.event_title}</p>
                        <p className="mt-1 text-xs text-text-secondary-strong">
                          EO: {review.eo} · Sponsor: {review.sponsor}
                        </p>
                        <p className="mt-0.5 text-[11px] tabular-nums text-text-muted">{formatDateTime(review.submitted_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 text-sm text-text">
                          <Star className="h-4 w-4" />
                          <span>{review.overall_rating}/5</span>
                        </div>
                        <StatusBadge status={review.status} />
                      </div>
                    </div>
                    {review.comment ? <p className="text-sm text-text-secondary-strong whitespace-pre-wrap">{review.comment}</p> : null}
                    {review.status === 'published' ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          hideForm.post(`/admin/reviews/${review.id}/hide`, { preserveScroll: true });
                        }}
                        className="flex flex-col gap-2 sm:flex-row sm:items-end"
                      >
                        <Field label="Alasan sembunyikan" className="flex-1">
                          <Textarea value={hideForm.data.reason} onChange={(e) => hideForm.setData('reason', e.target.value)} rows={2} required />
                        </Field>
                        <button
                          type="submit"
                          className={buttonClasses({ variant: 'destructive-outline' })}
                          disabled={hideForm.processing}
                        >
                          {hideForm.processing ? 'Menyembunyikan…' : 'Sembunyikan ulasan'}
                        </button>
                      </form>
                    ) : null}
                    {review.status === 'hidden' && review.hidden_reason ? (
                      <p className="text-xs text-text-muted">Alasan: {review.hidden_reason}</p>
                    ) : null}
                    {review.status === 'hidden' ? (
                      <button
                        type="button"
                        onClick={() => restoreForm.post(`/admin/reviews/${review.id}/restore`, { preserveScroll: true })}
                        className={buttonClasses()}
                        disabled={restoreForm.processing}
                      >
                        Tampilkan kembali
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Pagination paginator={reviews} />
              </div>
            </>
          ) : (
            <EmptyState
              className="mt-6"
              illustration="shield"
              title="Belum ada ulasan"
              description="Ulasan sponsor akan muncul di sini untuk dimoderasi."
            />
          )}
        </div>

        <aside>
          <div className="rounded-[12px] border border-border bg-background-muted p-4">
            <h2 className="text-sm font-semibold text-text">Ringkasan</h2>
            <div className="mt-3 divide-y divide-border">
              <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-text-secondary-strong">Diterbitkan</span>
                <span className="tabular-nums text-text">{counts.published ?? 0}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-text-secondary-strong">Disembunyikan</span>
                <span className="tabular-nums text-text">{counts.hidden ?? 0}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Hanya admin dapat menyembunyikan ulasan. Menampilkan kembali ulasan akan menghitung ulang rating EO.
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}
