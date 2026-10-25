<?php

namespace App\Http\Controllers;

use App\Enums\ReportTargetType;
use App\Services\ReportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public function store(Request $request, ReportService $service): RedirectResponse
    {
        $data = $request->validate([
            'target_type' => ['required', Rule::enum(ReportTargetType::class)],
            'target_id' => ['required', 'integer', 'min:1'],
            'reason' => ['required', Rule::in(array_keys(ReportService::REASONS))],
            'details' => ['nullable', 'string', 'max:1000'],
        ]);

        $service->create(
            $request->user(),
            ReportTargetType::from($data['target_type']),
            (int) $data['target_id'],
            $data['reason'],
            $data['details'] ?? null,
        );

        return back()->with('success', 'Laporan diterima. Tim kami akan meninjaunya.');
    }
}
