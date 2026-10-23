<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportStatus;
use App\Enums\SponsorVerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Report;
use App\Models\SponsorVerification;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $pending = SponsorVerification::with('organization')
            ->whereIn('status', [
                SponsorVerificationStatus::Submitted,
                SponsorVerificationStatus::UnderReview,
            ])
            ->latest('submitted_at')
            ->get();

        $recentAudit = AuditLog::with('actor')
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('admin/Dashboard', [
            'pendingVerifications' => $pending->take(5)->map(fn ($verification) => [
                'id' => $verification->id,
                'organization_name' => $verification->organization->display_name,
                'status' => $verification->status->value,
                'submitted_at' => $verification->submitted_at?->toISOString(),
            ]),
            'counts' => [
                'pending_verifications' => $pending->count(),
                'open_reports' => Report::whereIn('status', [ReportStatus::Open, ReportStatus::InReview])->count(),
            ],
            'recentAudit' => $recentAudit->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'actor' => $log->actor?->name,
                'created_at' => $log->created_at->toISOString(),
            ]),
        ]);
    }
}
