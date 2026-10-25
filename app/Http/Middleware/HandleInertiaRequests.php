<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $organization = $user?->organization;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'account_status' => $user->account_status?->value ?? 'active',
                    'email_verified' => $user->hasVerifiedEmail(),
                ] : null,
                'organization' => $organization ? [
                    'id' => $organization->id,
                    'type' => $organization->type->value,
                    'display_name' => $organization->display_name,
                    'location' => $organization->location,
                    'verification_status' => $organization->verification?->status->value,
                    'proposal_preference' => $organization->proposal_preference->value,
                    'rating_average' => $organization->rating_average,
                    'review_count' => $organization->review_count,
                ] : null,
                'is_sponsor_active' => $user?->hasActiveSponsorAccess() ?? false,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'reportReasons' => fn () => $user ? \App\Services\ReportService::reasonOptions() : null,
            'unreadNotifications' => fn () => $user?->unreadNotifications()->count() ?? 0,
        ];
    }
}
