<?php

namespace App\Enums;

enum ProposalStatus: string
{
    case Draft = 'draft';
    case Sent = 'sent';
    case UnderReview = 'under_review';
    case MoreInformationRequested = 'more_information_requested';
    case Negotiation = 'negotiation';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Withdrawn = 'withdrawn';
    case Expired = 'expired';

    public function isOpen(): bool
    {
        return in_array($this, [
            self::Sent,
            self::UnderReview,
            self::MoreInformationRequested,
            self::Negotiation,
            self::Accepted,
        ], true);
    }
}
