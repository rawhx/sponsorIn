<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $emailUrl = config('app.email_url');

        if (filled($emailUrl)) {
            VerifyEmail::createUrlUsing(function ($notifiable) use ($emailUrl): string {
                URL::forceRootUrl(rtrim($emailUrl, '/'));
                URL::forceScheme(parse_url($emailUrl, PHP_URL_SCHEME) ?: 'https');

                try {
                    return URL::temporarySignedRoute(
                        'verification.verify',
                        now()->addMinutes(config('auth.verification.expire', 60)),
                        [
                            'id' => $notifiable->getKey(),
                            'hash' => sha1($notifiable->getEmailForVerification()),
                        ],
                        absolute: true,
                    );
                } finally {
                    URL::forceRootUrl(null);
                    URL::forceScheme(null);
                }
            });
        }
    }
}
