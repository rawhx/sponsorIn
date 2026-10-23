<?php

namespace App\Enums;

enum SponsorVerificationStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case NeedsInformation = 'needs_information';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Suspended = 'suspended';

    public function isFinal(): bool
    {
        return in_array($this, [self::Approved, self::Rejected, self::Suspended], true);
    }

    public function isPending(): bool
    {
        return ! $this->isFinal();
    }
}
