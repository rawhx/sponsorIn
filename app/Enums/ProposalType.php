<?php

namespace App\Enums;

enum ProposalType: string
{
    case EoToSponsor = 'eo_to_sponsor';
    case SponsorToEo = 'sponsor_to_eo';
}
