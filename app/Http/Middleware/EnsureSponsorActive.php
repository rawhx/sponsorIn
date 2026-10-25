<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSponsorActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user?->hasActiveSponsorAccess()) {
            $request->session()->flash(
                'error',
                'Fitur sponsor aktif tersedia setelah verifikasi usaha disetujui.'
            );

            return redirect()->route('sponsor.verification.show')->withInput();
        }

        return $next($request);
    }
}
