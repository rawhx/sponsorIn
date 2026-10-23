<?php

namespace App\Enums;

enum SupportType: string
{
    case Cash = 'cash';
    case Product = 'product';
    case Service = 'service';
    case Media = 'media';
    case Other = 'other';
}
