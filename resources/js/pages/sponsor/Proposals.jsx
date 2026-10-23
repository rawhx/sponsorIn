import ProposalIndex from '../../components/proposals/ProposalIndex';

export default function Proposals({ proposals, filters, counts, statuses }) {
  return (
    <ProposalIndex
      eyebrow="Kesepakatan"
      title="Proposal"
      basePath="/sponsor/proposals"
      proposals={proposals}
      filters={filters}
      counts={counts}
      statuses={statuses}
    />
  );
}
