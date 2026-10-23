<?php

namespace App\Models;

use App\Enums\AccountStatus;
use App\Enums\SponsorVerificationStatus;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'account_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'account_status' => AccountStatus::class,
        ];
    }

    public function organization(): HasOne
    {
        return $this->hasOne(Organization::class, 'owner_user_id');
    }

    public function isSponsor(): bool
    {
        return $this->role === UserRole::Sponsor;
    }

    public function isEo(): bool
    {
        return $this->role === UserRole::Eo;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isVerifier(): bool
    {
        return $this->role === UserRole::Verifier;
    }

    public function isStaff(): bool
    {
        return $this->role->isStaff();
    }

    public function hasActiveAccount(): bool
    {
        return $this->account_status === AccountStatus::Active;
    }

    public function hasActiveSponsorAccess(): bool
    {
        return $this->isSponsor()
            && $this->hasActiveAccount()
            && $this->organization?->verification?->status === SponsorVerificationStatus::Approved;
    }
}
