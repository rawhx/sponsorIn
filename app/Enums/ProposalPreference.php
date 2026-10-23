<?php

namespace App\Enums;

enum ProposalPreference: string
{
    case Open = 'open';
    case Selective = 'selective';
    case Closed = 'closed';

    public function acceptsProposals(): bool
    {
        return $this !== self::Closed;
    }
}
