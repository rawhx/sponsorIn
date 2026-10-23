<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSponsorActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user?->hasActiveSponsorAccess()) {
            abort(403, 'Fitur sponsor aktif tersedia setelah verifikasi usaha disetujui.');
        }

        return $next($request);
    }
}
