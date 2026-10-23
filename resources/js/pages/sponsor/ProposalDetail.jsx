import { Link, useForm } from '@inertiajs/react';
import { Handshake } from 'lucide-react';
import { buttonClasses } from '../../components/Button';
import ProposalDetailView from '../../components/proposals/ProposalDetailView';

export default function ProposalDetail({ proposal, transitions, statuses }) {
  const form = useForm({});

  const asideExtra =
    proposal.status === 'accepted' ? (
      <div className="rounded-[12px] border border-border bg-background-muted p-5">
        <h2 className="text-sm font-semibold text-text">Kerja sama</h2>
        {proposal.sponsorship_id ? (
          <>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
              Proposal ini sudah tercatat sebagai kerja sama aktif.
            </p>
            <Link
              href={`/sponsor/sponsorships/${proposal.sponsorship_id}`}
              className={buttonClasses({ className: 'mt-3 w-full justify-center' })}
            >
              <Handshake className="h-4 w-4" aria-hidden="true" />
              Buka kerja sama
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary-strong">
              Catat kesepakatan ini sebagai kerja sama agar kedua pihak dapat memantau penyelesaian dan ulasan.
            </p>
            <button
              type="button"
              onClick={() => form.post(`/sponsor/proposals/${proposal.id}/sponsorship`, { preserveScroll: true })}
              className={buttonClasses({ className: 'mt-3 w-full justify-center' })}
              disabled={form.processing}
            >
              <Handshake className="h-4 w-4" aria-hidden="true" />
              {form.processing ? 'Menyimpan…' : 'Catat kerja sama'}
            </button>
          </>
        )}
      </div>
    ) : null;

  return (
    <ProposalDetailView
      eyebrow="Kesepakatan"
      basePath="/sponsor/proposals"
      proposal={proposal}
      transitions={transitions}
      statuses={statuses}
      backHref="/sponsor/proposals"
      backLabel="Kembali ke proposal"
      counterpartRoleLabel="Penyelenggara"
      asideExtra={asideExtra}
    />
  );
}
