import ProposalDetailView from '../../components/proposals/ProposalDetailView';

export default function ProposalDetail({ proposal, transitions, statuses, managementContext = false }) {
  return (
    <ProposalDetailView
      eyebrow="Kolaborasi"
      basePath="/eo/proposals"
      proposal={proposal}
      transitions={transitions}
      statuses={statuses}
      backHref={managementContext ? '/eo/sponsorships' : '/eo/proposals'}
      backLabel={managementContext ? 'Kembali ke kerja sama' : 'Kembali ke proposal'}
      counterpartRoleLabel="Sponsor"
    />
  );
}
