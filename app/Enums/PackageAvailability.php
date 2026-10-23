<?php

namespace App\Enums;

enum PackageAvailability: string
{
    case Available = 'available';
    case Limited = 'limited';
    case Closed = 'closed';
}
