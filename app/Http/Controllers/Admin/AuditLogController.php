<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function __construct(private AuditLogger $audit) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'action' => ['nullable', 'string', 'max:120'],
            'entity' => ['nullable', 'string', 'max:120'],
        ]);

        $query = AuditLog::with('actor')->latest('id');

        if ($request->filled('action')) {
            $query->where('action', 'like', "%{$filters['action']}%");
        }

        if ($request->filled('entity')) {
            $query->where('entity_type', 'like', "%{$filters['entity']}%")
                ->orWhere('entity_id', 'like', "%{$filters['entity']}%");
        }

        $logs = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/AuditLog', [
            'logs' => $this->formatLogs($logs),
            'filters' => [
                'action' => $request->string('action')->toString(),
                'entity' => $request->string('entity')->toString(),
            ],
        ]);
    }

    public function show(AuditLog $auditLog): Response
    {
        return Inertia::render('admin/AuditLog/Show', [
            'log' => $this->formatLog($auditLog),
        ]);
    }

    private function formatLogs(LengthAwarePaginator $logs): array
    {
        return $logs->through(fn (AuditLog $log) => [
            'id' => $log->id,
            'action' => $log->action,
            'entity_type' => class_basename($log->entity_type),
            'entity_id' => (string) $log->entity_id,
            'before' => $log->before_summary,
            'after' => $log->after_summary,
            'reason' => $log->reason,
            'created_at' => $log->created_at->toISOString(),
            'actor' => $log->actor ? $log->actor->name : 'sistem',
        ]);
    }

    private function formatLog(AuditLog $log): array
    {
        return [
            'id' => $log->id,
            'action' => $log->action,
            'entity_type' => class_basename($log->entity_type),
            'entity_id' => (string) $log->entity_id,
            'before' => $log->before_summary,
            'after' => $log->after_summary,
            'reason' => $log->reason,
            'created_at' => $log->created_at->toISOString(),
            'actor' => $log->actor ? $log->actor->name : 'sistem',
        ];
    }
}
