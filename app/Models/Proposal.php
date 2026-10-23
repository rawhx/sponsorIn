<?php

namespace App\Models;

use App\Enums\ProposalStatus;
use App\Enums\ProposalType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'sender_org_id',
        'recipient_org_id',
        'proposal_type',
        'package_id',
        'requested_support',
        'deliverables',
        'terms_summary',
        'status',
        'valid_until',
        'sponsor_confirmed_at',
        'eo_confirmed_at',
        'last_status_at',
    ];

    protected function casts(): array
    {
        return [
            'proposal_type' => ProposalType::class,
            'status' => ProposalStatus::class,
            'valid_until' => 'date',
            'sponsor_confirmed_at' => 'datetime',
            'eo_confirmed_at' => 'datetime',
            'last_status_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function senderOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'sender_org_id');
    }

    public function recipientOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'recipient_org_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(SponsorshipPackage::class, 'package_id');
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class);
    }

    public function sponsorship(): HasOne
    {
        return $this->hasOne(Sponsorship::class);
    }

    public function isParty(Organization $organization): bool
    {
        return in_array($organization->id, [$this->sender_org_id, $this->recipient_org_id], true);
    }
}
