import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, MapPin, MessageSquare, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { buttonClasses } from '../../components/Button';
import { Field, Textarea } from '../../components/Form';
import { formatDate } from '../../lib/utils';
import SponsorshipChat from '../../components/sponsorships/SponsorshipChat';

export default function SponsorshipDetail({ sponsorship }) {
  const { flash } = usePage().props;
  const requestForm = useForm({});
  const confirmForm = useForm({});
  const disputeForm = useForm({ reason: '' });

  const isSponsor = sponsorship.role === 'sponsor';
  const s = sponsorship;

  return (
    <DashboardLayout
      eyebrow="Detail Kerja Sama EO"
      title={s.event.title}
      actions={
        <div className="flex items-center gap-2">
          <StatusBadge status={s.status} />
          <Link href="/eo/sponsorships" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      }
    >
      <Head title={`Kerja Sama · ${s.event.title}`} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="space-y-6">
          {/* Agreement summary */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mitra Brand Sponsor</p>
                <h2 className="text-lg font-bold text-slate-900">{s.sponsor}</h2>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                    {formatDate(s.event.date_start)}{s.event.date_end && s.event.date_end !== s.event.date_start ? ` – ${formatDate(s.event.date_end)}` : ''}
                  </span>
                  {s.event.location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      {s.event.location}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Ringkasan Klausul Kesepakatan</h3>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                  {s.agreed_terms || 'Tidak ada ringkasan tertulis khusus.'}
                </p>
              </div>
              {s.deliverables ? (
                <div>
                  <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Deliverables (Kewajiban Timbal Balik)</h3>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {s.deliverables}
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          {/* Chat room */}
          <SponsorshipChat sponsorship={s} basePath="/eo/sponsorships" />

          {/* Reviews if any */}
          {s.review ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Ulasan dari Brand Sponsor</h2>
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                  <span className="font-bold text-slate-900">⭐ Keseluruhan: {s.review.overall_rating}/5</span>
                  <span>Komunikasi: {s.review.communication_rating}/5</span>
                  <span>Profesionalisme: {s.review.professionalism_rating}/5</span>
                  <span>Deliverables: {s.review.deliverables_rating}/5</span>
                </div>
                {s.review.comment ? (
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    "{s.review.comment}"
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        {/* Aside */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Tindakan Kerja Sama</h2>
            <div className="mt-4 space-y-3">
              {s.status === 'active' && !isSponsor ? (
                <button
                  type="button"
                  onClick={() => requestForm.post(`/eo/sponsorships/${s.id}/request-completion`, { preserveScroll: true })}
                  className={buttonClasses({ className: 'w-full justify-center', size: 'md' })}
                  disabled={requestForm.processing}
                >
                  Ajukan Selesai Kerja Sama
                </button>
              ) : null}
              {s.status === 'completion_requested' ? (
                <>
                  <button
                    type="button"
                    onClick={() => confirmForm.post(`/eo/sponsorships/${s.id}/confirm-completion`, { preserveScroll: true })}
                    className={buttonClasses({ className: 'w-full justify-center', size: 'md' })}
                    disabled={confirmForm.processing}
                  >
                    Konfirmasi Tuntas Selesai
                  </button>
                  <form onSubmit={(e) => { e.preventDefault(); disputeForm.post(`/eo/sponsorships/${s.id}/dispute`, { preserveScroll: true }); }} className="space-y-2 pt-2 border-t border-slate-100">
                    <Field label="Ajukan Sengketa (Bila ada pelanggaran hak)">
                      <Textarea value={disputeForm.data.reason} onChange={(e) => disputeForm.setData('reason', e.target.value)} rows={3} placeholder="Jelaskan alasan sengketa..." required />
                    </Field>
                    <button type="submit" className={buttonClasses({ variant: 'destructive-outline', className: 'w-full justify-center', size: 'sm' })} disabled={disputeForm.processing}>
                      Ajukan Sengketa ke Admin
                    </button>
                  </form>
                </>
              ) : null}
              {s.status === 'needs_admin_review' ? (
                <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  Menunggu peninjauan admin sistem (tidak ada konfirmasi dalam 7 hari).
                </p>
              ) : null}
              {s.status === 'disputed' ? (
                <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
                  Sedang dalam status sengketa. Admin platform akan menengahi.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Informasi Kontrak</h2>
            <dl className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <dt className="text-slate-500">Pihak Terkait</dt>
                <dd className="font-semibold text-slate-800">{s.sponsor} × {s.eo}</dd>
              </div>
              {s.accepted_at ? (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Disepakati Tanggal</dt>
                  <dd className="font-semibold text-slate-800 tabular-nums">{formatDate(s.accepted_at)}</dd>
                </div>
              ) : null}
              {s.completed_at ? (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500">Tuntas Selesai</dt>
                  <dd className="font-semibold text-slate-800 tabular-nums">{formatDate(s.completed_at)}</dd>
                </div>
              ) : null}
            </dl>
            {s.proposal_id ? (
              <Link href={`/eo/proposals/${s.proposal_id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                <MessageSquare className="h-3.5 w-3.5" />
                Buka arsip proposal awal
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
