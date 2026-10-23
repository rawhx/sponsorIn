<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        return match ($request->user()->role->value) {
            'sponsor' => redirect()->route('sponsor.dashboard'),
            'eo' => redirect()->route('eo.dashboard'),
            default => redirect()->route('admin.dashboard'),
        };
    }
}
