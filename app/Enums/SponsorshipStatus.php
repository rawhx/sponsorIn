<?php

namespace App\Enums;

enum SponsorshipStatus: string
{
    case Active = 'active';
    case CompletionRequested = 'completion_requested';
    case Completed = 'completed';
    case Disputed = 'disputed';
    case NeedsAdminReview = 'needs_admin_review';
    case Cancelled = 'cancelled';

    public function isOpen(): bool
    {
        return in_array($this, [
            self::Active,
            self::CompletionRequested,
            self::Disputed,
            self::NeedsAdminReview,
        ], true);
    }
}
