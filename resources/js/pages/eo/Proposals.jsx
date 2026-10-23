import ProposalIndex from '../../components/proposals/ProposalIndex';

export default function Proposals({ proposals, filters, counts, statuses }) {
  return (
    <ProposalIndex
      eyebrow="Kolaborasi"
      title="Proposal masuk"
      basePath="/eo/proposals"
      createHref="/eo/proposals/create"
      proposals={proposals}
      filters={filters}
      counts={counts}
      statuses={statuses}
    />
  );
}
