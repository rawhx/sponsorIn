<?php

namespace App\Models;

use App\Enums\BusinessLegalForm;
use App\Enums\SponsorVerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SponsorVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'business_email',
        'legal_form',
        'nib',
        'tax_id',
        'supporting_document_path',
        'status',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'decision_reason_internal',
        'decision_reason_public',
    ];

    protected $hidden = [
        'business_email',
        'nib',
        'tax_id',
        'supporting_document_path',
        'decision_reason_internal',
    ];

    protected function casts(): array
    {
        return [
            'business_email' => 'encrypted',
            'nib' => 'encrypted',
            'tax_id' => 'encrypted',
            'legal_form' => BusinessLegalForm::class,
            'status' => SponsorVerificationStatus::class,
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
