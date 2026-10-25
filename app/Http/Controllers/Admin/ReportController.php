<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportStatus;
use App\Enums\ReportTargetType;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::enum(ReportStatus::class)],
            'target_type' => ['nullable', Rule::enum(ReportTargetType::class)],
        ]);

        $reports = Report::query()
            ->with(['reporter', 'assignedAdmin'])
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['target_type'] ?? null, fn ($q, $type) => $q->where('target_type', $type))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Report $report) => [
                'id' => $report->id,
                'target_type' => $report->target_type->value,
                'reason' => $report->reason,
                'status' => $report->status->value,
                'reporter' => $report->reporter->name,
                'assigned_admin' => $report->assignedAdmin?->name,
                'created_at' => $report->created_at->toISOString(),
            ]);

        return Inertia::render('admin/Reports', [
            'reports' => $reports,
            'filters' => [
                'status' => $request->string('status')->toString(),
                'target_type' => $request->string('target_type')->toString(),
            ],
            'counts' => [
                'open' => Report::where('status', ReportStatus::Open)->count(),
                'in_review' => Report::where('status', ReportStatus::InReview)->count(),
                'resolved' => Report::where('status', ReportStatus::Resolved)->count(),
                'dismissed' => Report::where('status', ReportStatus::Dismissed)->count(),
            ],
        ]);
    }

    public function show(Report $report, ReportService $service): Response
    {
        $report->load(['reporter', 'assignedAdmin']);

        return Inertia::render('admin/ReportDetail', [
            'report' => [
                'id' => $report->id,
                'target_type' => $report->target_type->value,
                'reason' => $report->reason,
                'details' => $report->details,
                'status' => $report->status->value,
                'reporter' => $report->reporter->name,
                'assigned_admin' => $report->assignedAdmin?->name,
                'resolution' => $report->resolution,
                'resolved_at' => $report->resolved_at?->toISOString(),
                'created_at' => $report->created_at->toISOString(),
                'is_final' => in_array($report->status, [ReportStatus::Resolved, ReportStatus::Dismissed], true),
                'target' => $service->describeTarget($report),
            ],
            'auditLogs' => AuditLog::with('actor')
                ->where('entity_type', Report::class)
                ->where('entity_id', $report->id)
                ->latest()
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'actor' => $log->actor?->name,
                    'reason' => $log->reason,
                    'created_at' => $log->created_at->toISOString(),
                ]),
        ]);
    }

    public function update(Request $request, Report $report, ReportService $service): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([ReportStatus::InReview->value, ReportStatus::Resolved->value, ReportStatus::Dismissed->value])],
            'resolution' => ['nullable', 'string', 'max:2000'],
            'suspend_account' => ['nullable', 'boolean'],
        ]);

        $service->review(
            $report,
            $request->user(),
            ReportStatus::from($data['status']),
            $data['resolution'] ?? null,
            (bool) ($data['suspend_account'] ?? false),
        );

        return redirect()
            ->route('admin.reports.show', $report)
            ->with('success', 'Tindak lanjut laporan disimpan.');
    }
}
