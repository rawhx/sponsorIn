<?php

namespace App\Enums;

enum EventStatus: string
{
    case Draft = 'draft';
    case UnderReview = 'under_review';
    case NeedsChanges = 'needs_changes';
    case Published = 'published';
    case Closed = 'closed';
    case Rejected = 'rejected';
    case Unpublished = 'unpublished';

    public function isPublic(): bool
    {
        return $this === self::Published;
    }

    public function canBeEdited(): bool
    {
        return in_array($this, [self::Draft, self::NeedsChanges], true);
    }
}
