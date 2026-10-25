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

    /**
     * Keputusan moderasi yang boleh diambil admin dari status ini.
     *
     * @return array<int, self>
     */
    public function allowedModerationDecisions(): array
    {
        return match ($this) {
            self::UnderReview => [self::Published, self::NeedsChanges, self::Rejected],
            self::Published => [self::Unpublished],
            self::Unpublished => [self::Published],
            default => [],
        };
    }

    public function canBeModeratedTo(self $to): bool
    {
        return in_array($to, $this->allowedModerationDecisions(), true);
    }
}
