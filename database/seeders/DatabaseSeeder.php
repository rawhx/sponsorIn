<?php

namespace Database\Seeders;

use App\Enums\ReportTargetType;
use App\Models\AuditLog;
use App\Models\Conversation;
use App\Models\Event;
use App\Models\Message;
use App\Models\Organization;
use App\Models\Proposal;
use App\Models\Report;
use App\Models\Review;
use App\Models\Shortlist;
use App\Models\Sponsorship;
use App\Models\SponsorVerification;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            throw new \RuntimeException('Seeder demo tidak boleh dijalankan di environment production.');
        }

        $this->cleanDemoData();

        $this->call([
            DemoAccountsSeeder::class,
            DemoEventsSeeder::class,
            DemoProposalsSeeder::class,
            DemoEngagementSeeder::class,
        ]);

        $this->command?->info('Seeder demo selesai. Gunakan password "'.DemoData::PASSWORD.'" untuk semua akun demo.');
        $this->command?->info('Admin: admin@sponsorin.test | Verifier: verifier@sponsorin.test | EO: eo@sponsorin.test | Sponsor: sponsor@sponsorin.test');
    }

    private function cleanDemoData(): void
    {
        $userIds = User::query()->whereIn('email', DemoAccountsSeeder::emails())->pluck('id');
        $orgIds = Organization::query()->whereIn('owner_user_id', $userIds)->pluck('id');
        $eventIds = Event::query()->whereIn('eo_organization_id', $orgIds)->pluck('id');
        $proposalIds = Proposal::query()
            ->where(fn ($query) => $query->whereIn('sender_org_id', $orgIds)->orWhereIn('recipient_org_id', $orgIds))
            ->pluck('id');
        $conversationIds = Conversation::query()->whereIn('proposal_id', $proposalIds)->pluck('id');
        $sponsorshipIds = Sponsorship::query()
            ->where(fn ($query) => $query->whereIn('sponsor_org_id', $orgIds)->orWhereIn('eo_org_id', $orgIds))
            ->pluck('id');
        $reviewIds = Review::query()
            ->where(function ($query) use ($sponsorshipIds, $orgIds) {
                $query->whereIn('sponsorship_id', $sponsorshipIds)
                    ->orWhereIn('sponsor_org_id', $orgIds)
                    ->orWhereIn('eo_org_id', $orgIds);
            })
            ->pluck('id');
        $verificationIds = SponsorVerification::query()->whereIn('organization_id', $orgIds)->pluck('id');

        DB::table('notifications')
            ->where('notifiable_type', User::class)
            ->whereIn('notifiable_id', $userIds)
            ->delete();

        Report::query()
            ->where(function ($query) use ($userIds, $eventIds, $reviewIds) {
                $query->whereIn('reporter_user_id', $userIds)
                    ->orWhere(fn ($target) => $target->where('target_type', ReportTargetType::Event->value)->whereIn('target_id', $eventIds))
                    ->orWhere(fn ($target) => $target->where('target_type', ReportTargetType::Account->value)->whereIn('target_id', $userIds))
                    ->orWhere(fn ($target) => $target->where('target_type', ReportTargetType::Review->value)->whereIn('target_id', $reviewIds));
            })
            ->delete();

        AuditLog::query()->whereIn('actor_user_id', $userIds)->delete();

        foreach ([
            Event::class => $eventIds,
            Proposal::class => $proposalIds,
            Sponsorship::class => $sponsorshipIds,
            Review::class => $reviewIds,
            SponsorVerification::class => $verificationIds,
        ] as $entityType => $entityIds) {
            if ($entityIds->isNotEmpty()) {
                AuditLog::query()
                    ->where('entity_type', $entityType)
                    ->whereIn('entity_id', $entityIds)
                    ->delete();
            }
        }

        Message::query()
            ->where(function ($query) use ($conversationIds, $userIds) {
                $query->whereIn('conversation_id', $conversationIds)
                    ->orWhereIn('sender_user_id', $userIds);
            })
            ->delete();

        Conversation::query()->whereIn('proposal_id', $proposalIds)->delete();
        Review::query()->whereIn('id', $reviewIds)->delete();
        Sponsorship::query()->whereIn('id', $sponsorshipIds)->delete();
        Proposal::query()->whereIn('id', $proposalIds)->delete();
        Shortlist::query()->whereIn('organization_id', $orgIds)->delete();
        Event::query()->whereIn('id', $eventIds)->delete();
        SponsorVerification::query()->whereIn('id', $verificationIds)->delete();
    }
}
