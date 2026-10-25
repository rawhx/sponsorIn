<?php

namespace App\Models;

use App\Enums\OrganizationType;
use App\Enums\ProposalPreference;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_user_id',
        'type',
        'legal_name',
        'display_name',
        'description',
        'portfolio',
        'category',
        'location',
        'public_contact',
        'public_visibility',
        'proposal_preference',
        'rating_average',
        'review_count',
    ];

    protected function casts(): array
    {
        return [
            'type' => OrganizationType::class,
            'public_visibility' => 'boolean',
            'proposal_preference' => ProposalPreference::class,
            'rating_average' => 'decimal:1',
            'review_count' => 'integer',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function verification(): HasOne
    {
        return $this->hasOne(SponsorVerification::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'eo_organization_id');
    }

    public function proposalsSent(): HasMany
    {
        return $this->hasMany(Proposal::class, 'sender_org_id');
    }

    public function proposalsReceived(): HasMany
    {
        return $this->hasMany(Proposal::class, 'recipient_org_id');
    }

    public function shortlists(): HasMany
    {
        return $this->hasMany(Shortlist::class);
    }

    public function isSponsor(): bool
    {
        return $this->type === OrganizationType::Sponsor;
    }

    public function isEo(): bool
    {
        return $this->type === OrganizationType::Eo;
    }
}
