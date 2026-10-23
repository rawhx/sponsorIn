<?php

namespace App\Models;

use App\Enums\PackageAvailability;
use App\Enums\SupportType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SponsorshipPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'name',
        'support_type',
        'price_amount',
        'currency',
        'benefits',
        'deliverables',
        'availability_status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'support_type' => SupportType::class,
            'benefits' => 'array',
            'deliverables' => 'array',
            'price_amount' => 'decimal:2',
            'availability_status' => PackageAvailability::class,
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
