import AgreementPanel from '../../components/proposals/AgreementPanel';
import ProposalDetailView from '../../components/proposals/ProposalDetailView';

export default function ProposalDetail({ proposal, transitions, statuses }) {
  return (
    <ProposalDetailView
      eyebrow="Kolaborasi"
      basePath="/eo/proposals"
      proposal={proposal}
      transitions={transitions}
      statuses={statuses}
      backHref="/eo/proposals"
      backLabel="Kembali ke proposal"
      counterpartRoleLabel="Sponsor"
      asideExtra={<AgreementPanel proposal={proposal} role="eo" />}
    />
  );
}
