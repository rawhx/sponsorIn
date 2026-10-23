<?php

namespace Database\Factories;

use App\Enums\PackageAvailability;
use App\Enums\SupportType;
use App\Models\SponsorshipPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SponsorshipPackage>
 */
class SponsorshipPackageFactory extends Factory
{
    protected $model = SponsorshipPackage::class;

    public function definition(): array
    {
        return [
            'name' => 'Paket '.fake()->word(),
            'support_type' => SupportType::Cash,
            'price_amount' => fake()->numberBetween(1_000_000, 50_000_000),
            'currency' => 'IDR',
            'benefits' => ['Logo pada materi acara'],
            'deliverables' => ['Laporan setelah acara'],
            'availability_status' => PackageAvailability::Available,
        ];
    }
}
