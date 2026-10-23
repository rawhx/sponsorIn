<?php

namespace App\Models;

use App\Enums\AudienceEvidenceType;
use App\Enums\EvidenceVerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AudienceEvidence extends Model
{
    use HasFactory;

    protected $table = 'audience_evidence';

    protected $fillable = [
        'event_id',
        'evidence_type',
        'value',
        'unit',
        'period',
        'source_description',
        'evidence_note',
        'file_path',
        'verification_status',
    ];

    protected $hidden = [
        'file_path',
    ];

    protected function casts(): array
    {
        return [
            'evidence_type' => AudienceEvidenceType::class,
            'value' => 'decimal:2',
            'verification_status' => EvidenceVerificationStatus::class,
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
