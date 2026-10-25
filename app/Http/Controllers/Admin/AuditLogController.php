<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    private const ENTITIES = ['SponsorVerification', 'Event', 'Proposal', 'Sponsorship', 'Review', 'Report', 'User'];

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'entity' => ['nullable', Rule::in(self::ENTITIES)],
        ]);

        $logs = AuditLog::query()
            ->with('actor')
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where(function ($q) use ($term) {
                $q->where('action', 'like', "%{$term}%")->orWhere('reason', 'like', "%{$term}%");
            }))
            ->when($filters['entity'] ?? null, fn ($q, $entity) => $q->where('entity_type', 'App\\Models\\'.$entity))
            ->latest('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'entity' => class_basename($log->entity_type).' #'.$log->entity_id,
                'actor' => $log->actor?->name,
                'reason' => $log->reason,
                'before' => $log->before_summary,
                'after' => $log->after_summary,
                'created_at' => $log->created_at->toISOString(),
            ]);

        return Inertia::render('admin/AuditLog', [
            'logs' => $logs,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'entity' => $request->string('entity')->toString(),
            ],
            'entities' => self::ENTITIES,
        ]);
    }
}
