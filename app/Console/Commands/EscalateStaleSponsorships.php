<?php

namespace App\Console\Commands;

use App\Enums\SponsorshipStatus;
use App\Models\Sponsorship;
use App\Services\SponsorshipService;
use Illuminate\Console\Command;

class EscalateStaleSponsorships extends Command
{
    protected $signature = 'sponsorship:escalate-stale';

    protected $description = 'Escalate completion requests with no response after 7 days to needs admin review';

    public function handle(SponsorshipService $service): int
    {
        Sponsorship::query()
            ->where('status', SponsorshipStatus::CompletionRequested)
            ->where('completion_requested_at', '<=', now()->subDays(7))
            ->each(fn (Sponsorship $sponsorship) => $service->escalateStale($sponsorship));

        return self::SUCCESS;
    }
}
