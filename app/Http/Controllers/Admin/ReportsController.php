<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReportStatus;
use App\Enums\ReportTargetType;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Report;
use App\Services\AuditLogger;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function __construct(private AuditLogger $audit) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', ReportStatus::class],
        ]);

        $query = Report::query()
            ->with(['reporter', 'assignedAdmin'])
            ->latest('id');

        if ($request->filled('q')) {
            $term = $filters['q'];
            $query->where(function (Builder $q) use ($term) {
                $q->where('reason', 'like', "%{$term}%")
                    ->orWhere('details', 'like', "%{$term}%")
                    ->orWhereHas('reporter', fn (Builder $rq) => $rq->where('name', 'like', "%{$term}%"))
                    ->orWhereHas('assignedAdmin', fn (Builder $rq) => $rq->where('name', 'like', "%{$term}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $filters['status']);
        }

        $reports = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/Reports', [
            'reports' => $this->formatReports($reports),
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'counts' => [
                'open' => Report::where('status', ReportStatus::Open)->count(),
                'in_review' => Report::where('status', ReportStatus::InReview)->count(),
                'resolved' => Report::where('status', ReportStatus::Resolved)->count(),
                'dismissed' => Report::where('status', ReportStatus::Dismissed)->count(),
            ],
        ]);
    }

    public function show(Report $report): Response
    {
        $report->load(['reporter', 'assignedAdmin', 'target']);

        return Inertia::render('admin/Reports/Show', [
            'report' => $this->formatReport($report),
        ]);
    }

    public function resolve(Request $request, Report $report): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', ReportStatus::class],
            'resolution' => ['nullable', 'string', 'max:2000'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $before = ['status' => $report->status->value];

        $report->update([
            'status' => $data['status'],
            'resolution' => $data['resolution'] ?? $report->resolution,
            'resolved_at' => $data['status'] === ReportStatus::Resolved ? now() : null,
        ]);

        $this->audit->record(
            'report.'.$data['status'],
            $report,
            $request->user(),
            $before,
            ['status' => $data['status']->value],
            $data['note'] ?? null
        );

        return back()->with('success', 'Status laporan berhasil diperbarui.');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'target_type' => ['required', ReportTargetType::class],
            'target_id' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:2000'],
            'details' => ['nullable', 'string', 'max:4000'],
        ]);

        $report = Report::create([
            'reporter_user_id' => $request->user()->id,
            'target_type' => $data['target_type'],
            'target_id' => $data['target_id'],
            'reason' => $data['reason'],
            'details' => $data['details'],
            'status' => ReportStatus::Open,
        ]);

        $this->audit->record(
            'report.submitted',
            $report,
            $request->user(),
            [],
            ['status' => $report->status->value],
            'Laporan dibuat oleh pengguna.'
        );

        return back()->with('success', 'Laporan berhasil dikirim.');
    }

    private function formatReports(LengthAwarePaginator $reports): array
    {
        return $reports->through(fn (Report $report) => [
            'id' => $report->id,
            'target_type' => $report->target_type,
            'target_id' => $report->target_id,
            'target_label' => $this->targetLabel($report),
            'reason' => $report->reason,
            'details' => $report->details,
            'status' => $report->status->value,
            'reporter' => $report->reporter->name ?? '—',
            'assigned_admin' => $report->assignedAdmin->name ?? null,
            'created_at' => $report->created_at->toISOString(),
            'resolved_at' => $report->resolved_at?->toISOString(),
            'resolution' => $report->resolution,
        ]);
    }

    private function formatReport(Report $report): array
    {
        return [
            'id' => $report->id,
            'target_type' => $report->target_type,
            'target_id' => $report->target_id,
            'target_label' => $this->targetLabel($report),
            'reason' => $report->reason,
            'details' => $report->details,
            'status' => $report->status->value,
            'reporter' => $report->reporter->name ?? '—',
            'assigned_admin' => $report->assignedAdmin->name ?? null,
            'created_at' => $report->created_at->toISOString(),
            'resolved_at' => $report->resolved_at?->toISOString(),
            'resolution' => $report->resolution,
        ];
    }

    private function targetLabel(Report $report): string
    {
        $map = [
            ReportTargetType::Event->value => 'Event',
            ReportTargetType::Account->value => 'Akun',
            ReportTargetType::Review->value => 'Ulasan',
            ReportTargetType::Sponsorship->value => 'Kerja sama',
            ReportTargetType::Proposal->value => 'Proposal',
        ];

        $key = $report->target_type ?? '';
        $label = $map[$key] ?? 'Laporan';

        if ($key === ReportTargetType::Event->value) {
            $event = $report->target ?? null;
            if ($event) {
                $label .= ' · '.$event->title;
            }
        }

        return $label;
    }
}
