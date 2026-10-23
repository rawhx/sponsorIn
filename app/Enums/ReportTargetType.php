<?php

namespace App\Enums;

enum ReportTargetType: string
{
    case Event = 'event';
    case Account = 'account';
    case Review = 'review';
}
