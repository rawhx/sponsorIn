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

    /**
     * Transisi keputusan yang boleh dilakukan verifier/admin dari status ini.
     *
     * @return array<int, self>
     */
    public function allowedDecisions(): array
    {
        return match ($this) {
            self::Submitted => [self::UnderReview, self::Approved, self::NeedsInformation, self::Rejected],
            self::UnderReview => [self::Approved, self::NeedsInformation, self::Rejected],
            self::Approved => [self::Suspended],
            self::Suspended => [self::Approved],
            default => [],
        };
    }

    public function canTransitionTo(self $to): bool
    {
        return in_array($to, $this->allowedDecisions(), true);
    }
}
