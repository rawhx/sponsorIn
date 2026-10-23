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

      <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-text-secondary-strong hover:text-text">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="min-w-0 space-y-6">
          <ProposalHeader proposal={proposal} counterpartRoleLabel={counterpartRoleLabel} />

          <section className="rounded-[12px] border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-text">Isi proposal</h2>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <p className="text-xs text-text-muted">Dukungan yang diminta</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-secondary-strong">{proposal.requested_support}</p>
              </div>
              {proposal.deliverables ? (
                <div>
                  <p className="text-xs text-text-muted">Deliverable</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-secondary-strong">{proposal.deliverables}</p>
                </div>
              ) : null}
              {proposal.terms_summary ? (
                <div>
                  <p className="text-xs text-text-muted">Ringkasan ketentuan</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-secondary-strong">{proposal.terms_summary}</p>
                </div>
              ) : null}
              <div className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-muted">Event</p>
                  <p className="mt-0.5 text-text-secondary-strong">{proposal.event.location} · {formatDate(proposal.event.date_start)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Paket</p>
                  <p className="mt-0.5 text-text-secondary-strong">{proposal.package?.name ?? 'Tanpa paket tertentu'}</p>
                </div>
              </div>
            </div>
          </section>

          <ProposalThread proposal={withViewer} basePath={basePath} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {asideExtra}
          <ProposalStatusPanel proposal={proposal} transitions={transitions} basePath={basePath} statuses={statuses} />
        </aside>
      </div>
    </DashboardLayout>
  );
}
