<?php

namespace App\Enums;

enum UserRole: string
{
    case Sponsor = 'sponsor';
    case Eo = 'eo';
    case Admin = 'admin';
    case Verifier = 'verifier';

    public function isStaff(): bool
    {
        return in_array($this, [self::Admin, self::Verifier], true);
    }
}
