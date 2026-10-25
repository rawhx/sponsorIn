import AgreementPanel from '../../components/proposals/AgreementPanel';
import ProposalDetailView from '../../components/proposals/ProposalDetailView';

export default function ProposalDetail({ proposal, transitions, statuses }) {
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
      asideExtra={<AgreementPanel proposal={proposal} role="sponsor" />}
    />
  );
}
