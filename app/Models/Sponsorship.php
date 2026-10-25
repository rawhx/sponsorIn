<?php

namespace App\Models;

use App\Enums\SponsorshipStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Sponsorship extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'sponsor_org_id',
        'eo_org_id',
        'event_id',
        'agreed_terms',
        'deliverables',
        'status',
        'accepted_at',
        'completion_requested_by',
        'completion_requested_at',
        'completed_at',
        'dispute_reason',
        'cancellation_reason',
        'admin_resolution_note',
        'admin_resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => SponsorshipStatus::class,
            'accepted_at' => 'datetime',
            'completion_requested_at' => 'datetime',
            'completed_at' => 'datetime',
            'admin_resolved_at' => 'datetime',
        ];
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    public function sponsorOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'sponsor_org_id');
    }

    public function eoOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'eo_org_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function isParty(Organization $organization): bool
    {
        return in_array($organization->id, [$this->sponsor_org_id, $this->eo_org_id], true);
    }
}
