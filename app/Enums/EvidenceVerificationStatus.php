<?php

namespace App\Enums;

enum EvidenceVerificationStatus: string
{
    case Declared = 'declared';
    case Reviewed = 'reviewed';
}
