<?php

namespace App\Models;

use App\Enums\ReviewStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'sponsorship_id',
        'sponsor_org_id',
        'eo_org_id',
        'overall_rating',
        'communication_rating',
        'professionalism_rating',
        'deliverables_rating',
        'comment',
        'status',
        'submitted_at',
        'edited_at',
        'published_at',
        'hidden_reason',
    ];

    protected $hidden = [
        'hidden_reason',
    ];

    protected function casts(): array
    {
        return [
            'overall_rating' => 'integer',
            'communication_rating' => 'integer',
            'professionalism_rating' => 'integer',
            'deliverables_rating' => 'integer',
            'status' => ReviewStatus::class,
            'submitted_at' => 'datetime',
            'edited_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function sponsorship(): BelongsTo
    {
        return $this->belongsTo(Sponsorship::class);
    }

    public function sponsorOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'sponsor_org_id');
    }

    public function eoOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'eo_org_id');
    }
}
