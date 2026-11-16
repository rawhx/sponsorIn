import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { ProposalHeader, ProposalStatusPanel, ProposalThread } from '../../components/proposals/ProposalParts';
import { formatDate } from '../../lib/utils';

export default function ProposalDetailView({ eyebrow, basePath, proposal, transitions, statuses, backHref, backLabel, counterpartRoleLabel, asideExtra }) {
  const { auth } = usePage().props;
  const viewerUserId = auth?.user?.id;

  const withViewer = { ...proposal, viewerUserId };

  return (
    <DashboardLayout
      eyebrow={eyebrow}
      title={proposal.event.title}
      actions={<StatusBadge status={proposal.status} />}
    >
      <Head title={`Proposal · ${proposal.event.title}`} />

      <Link href={backHref} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="min-w-0 space-y-6">
          <ProposalHeader proposal={proposal} counterpartRoleLabel={counterpartRoleLabel} />

          <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
              <h2 className="text-sm font-bold text-slate-900">Rincian Penawaran & Permintaan</h2>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Dukungan yang Diminta / Ditawarkan</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-100 font-medium">
                  {proposal.requested_support}
                </p>
              </div>
              {proposal.deliverables ? (
                <div>
                  <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Deliverables (Kewajiban Timbal Balik)</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    {proposal.deliverables}
                  </p>
                </div>
              ) : null}
              {proposal.terms_summary ? (
                <div>
                  <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Ketentuan & Syarat Khusus</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    {proposal.terms_summary}
                  </p>
                </div>
              ) : null}
              <div className="grid gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-400">Lokasi & Tanggal Event</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{proposal.event.location} · {formatDate(proposal.event.date_start)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Paket Terpilih</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{proposal.package?.name ?? 'Tanpa paket tertentu'}</p>
                </div>
              </div>
            </div>
          </section>

          <ProposalThread proposal={withViewer} basePath={basePath} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          {asideExtra}
          <ProposalStatusPanel proposal={proposal} transitions={transitions} basePath={basePath} statuses={statuses} />
        </aside>
      </div>
    </DashboardLayout>
  );
}
