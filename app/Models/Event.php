<?php

namespace App\Models;

use App\Enums\EventStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'eo_organization_id',
        'title',
        'slug',
        'category',
        'format',
        'date_start',
        'date_end',
        'location',
        'description',
        'audience_profile',
        'capacity_estimate',
        'support_needs',
        'status',
        'published_at',
        'moderation_reason_internal',
        'moderation_reason_public',
    ];

    protected $hidden = [
        'moderation_reason_internal',
    ];

    protected function casts(): array
    {
        return [
            'date_start' => 'date',
            'date_end' => 'date',
            'capacity_estimate' => 'integer',
            'status' => EventStatus::class,
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Event $event) {
            if (blank($event->slug)) {
                $event->slug = Str::slug($event->title).'-'.Str::lower(Str::random(5));
            }
        });
    }

    public function eoOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'eo_organization_id');
    }

    public function audienceEvidence(): HasMany
    {
        return $this->hasMany(AudienceEvidence::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(SponsorshipPackage::class);
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class);
    }

    public function sponsorships(): HasMany
    {
        return $this->hasMany(Sponsorship::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', EventStatus::Published);
    }
}
