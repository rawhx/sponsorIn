<?php

namespace App\Http\Controllers\Auth;

use App\Enums\OrganizationType;
use App\Enums\SponsorVerificationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\SponsorVerification;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('auth/Register', [
            'selectedRole' => $request->query('role', 'sponsor'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email'))),
        ]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(10)],
            'role' => ['required', Rule::in([UserRole::Sponsor->value, UserRole::Eo->value])],
            'organization_name' => ['required', 'string', 'max:160'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $role = UserRole::from($data['role']);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $role,
            ]);

            $organization = Organization::create([
                'owner_user_id' => $user->id,
                'type' => $role === UserRole::Sponsor ? OrganizationType::Sponsor : OrganizationType::Eo,
                'legal_name' => $data['organization_name'],
                'display_name' => $data['organization_name'],
                'proposal_preference' => 'open',
            ]);

            if ($role === UserRole::Sponsor) {
                SponsorVerification::create([
                    'organization_id' => $organization->id,
                    'status' => SponsorVerificationStatus::Draft,
                ]);
            }

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect()
            ->route('verification.notice')
            ->with('success', 'Akun berhasil dibuat. Periksa email untuk memverifikasi alamat email Anda.');
    }
}
