<?php

namespace Database\Factories;

use App\Enums\AudienceEvidenceType;
use App\Enums\EvidenceVerificationStatus;
use App\Models\AudienceEvidence;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AudienceEvidence>
 */
class AudienceEvidenceFactory extends Factory
{
    protected $model = AudienceEvidence::class;

    public function definition(): array
    {
        return [
            'evidence_type' => AudienceEvidenceType::Projection,
            'value' => fake()->numberBetween(100, 5000),
            'unit' => 'orang',
            'period' => 'Perencanaan acara',
            'source_description' => 'Sumber contoh untuk pengujian',
            'verification_status' => EvidenceVerificationStatus::Declared,
        ];
    }
}
