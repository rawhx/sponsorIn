<?php

namespace App\Enums;

enum AudienceEvidenceType: string
{
    case Projection = 'projection';
    case Registration = 'registration';
    case TicketsSold = 'tickets_sold';
    case CheckIn = 'check_in';
    case PastEvent = 'past_event';
    case CommunityReach = 'community_reach';
}
