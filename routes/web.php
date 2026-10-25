<?php

use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EventModerationController as AdminEventController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ReviewModerationController as AdminReviewController;
use App\Http\Controllers\Admin\SponsorshipController as AdminSponsorshipController;
use App\Http\Controllers\Admin\VerificationController as AdminVerificationController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EO\AudienceEvidenceController;
use App\Http\Controllers\EO\DashboardController as EoDashboardController;
use App\Http\Controllers\EO\EventController as EoEventController;
use App\Http\Controllers\EO\PackageController;
use App\Http\Controllers\EO\ProfileController as EoProfileController;
use App\Http\Controllers\EO\ProposalController as EoProposalController;
use App\Http\Controllers\EO\SponsorshipController as EoSponsorshipController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PublicSite\EventController;
use App\Http\Controllers\PublicSite\HomeController;
use App\Http\Controllers\PublicSite\OrganizerController;
use App\Http\Controllers\Sponsor\DashboardController as SponsorDashboardController;
use App\Http\Controllers\Sponsor\OrganizationController as SponsorOrganizationController;
use App\Http\Controllers\Sponsor\ProposalController as SponsorProposalController;
use App\Http\Controllers\Sponsor\ShortlistController as SponsorShortlistController;
use App\Http\Controllers\Sponsor\SponsorshipController as SponsorSponsorshipController;
use App\Http\Controllers\Sponsor\SponsorVerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/events', [EventController::class, 'index'])->name('events.index');
Route::get('/events/{event:slug}', [EventController::class, 'show'])->name('events.show');
Route::get('/organizers', [OrganizerController::class, 'index'])->name('organizers.index');
Route::get('/organizers/{organization}', [OrganizerController::class, 'show'])->name('organizers.show');

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store'])->middleware('throttle:5,1');

    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:5,1');

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/verify-email', EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', EmailVerificationNotificationController::class)
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');

    Route::post('/reports', [ReportController::class, 'store'])
        ->middleware(['verified', 'throttle:10,1'])
        ->name('reports.store');

    Route::get('/dashboard', [DashboardController::class, 'redirect'])
        ->middleware('verified')
        ->name('dashboard');
});

Route::middleware(['auth', 'verified', 'role:sponsor'])
    ->prefix('sponsor')
    ->name('sponsor.')
    ->group(function () {
        Route::get('/dashboard', SponsorDashboardController::class)->name('dashboard');
        Route::get('/verification', [SponsorVerificationController::class, 'show'])->name('verification.show');
        Route::put('/verification', [SponsorVerificationController::class, 'update'])->name('verification.update');

        Route::middleware('sponsor.active')->group(function () {
            Route::get('/organizations', [SponsorOrganizationController::class, 'edit'])->name('organization.edit');
            Route::put('/organizations', [SponsorOrganizationController::class, 'update'])->name('organization.update');

            Route::get('/shortlist', [SponsorShortlistController::class, 'index'])->name('shortlist.index');
            Route::post('/events/{event}/shortlist', [SponsorShortlistController::class, 'store'])->name('shortlist.store');
            Route::delete('/events/{event}/shortlist', [SponsorShortlistController::class, 'destroy'])->name('shortlist.destroy');

            Route::post('/events/{event}/proposals', [SponsorProposalController::class, 'store'])->name('proposals.store');
            Route::get('/proposals', [SponsorProposalController::class, 'index'])->name('proposals.index');
            Route::get('/proposals/{proposal}', [SponsorProposalController::class, 'show'])->name('proposals.show');
            Route::post('/proposals/{proposal}/transition', [SponsorProposalController::class, 'transition'])->name('proposals.transition');
            Route::post('/proposals/{proposal}/messages', [SponsorProposalController::class, 'message'])->name('proposals.messages.store');

            Route::get('/sponsorships', [SponsorSponsorshipController::class, 'index'])->name('sponsorships.index');
            Route::post('/proposals/{proposal}/sponsorship', [SponsorSponsorshipController::class, 'store'])->name('sponsorships.store');
            Route::get('/sponsorships/{sponsorship}', [SponsorSponsorshipController::class, 'show'])->name('sponsorships.show');
            Route::post('/sponsorships/{sponsorship}/cancel', [SponsorSponsorshipController::class, 'cancel'])->name('sponsorships.cancel');
            Route::post('/sponsorships/{sponsorship}/request-completion', [SponsorSponsorshipController::class, 'requestCompletion'])->name('sponsorships.request-completion');
            Route::post('/sponsorships/{sponsorship}/confirm-completion', [SponsorSponsorshipController::class, 'confirmCompletion'])->name('sponsorships.confirm-completion');
            Route::post('/sponsorships/{sponsorship}/dispute', [SponsorSponsorshipController::class, 'raiseDispute'])->name('sponsorships.dispute');
            Route::post('/sponsorships/{sponsorship}/review', [SponsorSponsorshipController::class, 'storeReview'])->name('sponsorships.review.store');
            Route::put('/sponsorships/{sponsorship}/review', [SponsorSponsorshipController::class, 'updateReview'])->name('sponsorships.review.update');
        });
    });

Route::middleware(['auth', 'verified', 'role:eo'])
    ->prefix('eo')
    ->name('eo.')
    ->group(function () {
        Route::get('/dashboard', EoDashboardController::class)->name('dashboard');

        Route::get('/profile', [EoProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [EoProfileController::class, 'update'])->name('profile.update');

        Route::get('/events', [EoEventController::class, 'index'])->name('events.index');
        Route::get('/events/create', [EoEventController::class, 'create'])->name('events.create');
        Route::post('/events', [EoEventController::class, 'store'])->name('events.store');
        Route::get('/events/{event}', [EoEventController::class, 'show'])->name('events.show');
        Route::get('/events/{event}/edit', [EoEventController::class, 'edit'])->name('events.edit');
        Route::put('/events/{event}', [EoEventController::class, 'update'])->name('events.update');
        Route::post('/events/{event}/submit', [EoEventController::class, 'submit'])->name('events.submit');
        Route::post('/events/{event}/close', [EoEventController::class, 'close'])->name('events.close');

        Route::post('/events/{event}/evidence', [AudienceEvidenceController::class, 'store'])->name('events.evidence.store');
        Route::put('/events/{event}/evidence/{evidence}', [AudienceEvidenceController::class, 'update'])->name('events.evidence.update');
        Route::delete('/events/{event}/evidence/{evidence}', [AudienceEvidenceController::class, 'destroy'])->name('events.evidence.destroy');

        Route::post('/events/{event}/packages', [PackageController::class, 'store'])->name('events.packages.store');
        Route::put('/events/{event}/packages/{package}', [PackageController::class, 'update'])->name('events.packages.update');
        Route::delete('/events/{event}/packages/{package}', [PackageController::class, 'destroy'])->name('events.packages.destroy');

        Route::get('/proposals', [EoProposalController::class, 'index'])->name('proposals.index');
        Route::get('/proposals/create', [EoProposalController::class, 'create'])->name('proposals.create');
        Route::post('/proposals', [EoProposalController::class, 'store'])->name('proposals.store');
        Route::get('/proposals/{proposal}', [EoProposalController::class, 'show'])->name('proposals.show');
        Route::post('/proposals/{proposal}/transition', [EoProposalController::class, 'transition'])->name('proposals.transition');
        Route::post('/proposals/{proposal}/messages', [EoProposalController::class, 'message'])->name('proposals.messages.store');

        Route::post('/proposals/{proposal}/agreement', [EoSponsorshipController::class, 'store'])->name('sponsorships.store');
        Route::get('/sponsorships', [EoSponsorshipController::class, 'index'])->name('sponsorships.index');
        Route::get('/sponsorships/{sponsorship}', [EoSponsorshipController::class, 'show'])->name('sponsorships.show');
        Route::post('/sponsorships/{sponsorship}/cancel', [EoSponsorshipController::class, 'cancel'])->name('sponsorships.cancel');
        Route::post('/sponsorships/{sponsorship}/request-completion', [EoSponsorshipController::class, 'requestCompletion'])->name('sponsorships.request-completion');
        Route::post('/sponsorships/{sponsorship}/confirm-completion', [EoSponsorshipController::class, 'confirmCompletion'])->name('sponsorships.confirm-completion');
        Route::post('/sponsorships/{sponsorship}/dispute', [EoSponsorshipController::class, 'raiseDispute'])->name('sponsorships.dispute');
    });

Route::middleware(['auth', 'verified', 'role:admin,verifier'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');

        Route::get('/verifications', [AdminVerificationController::class, 'index'])->name('verifications.index');
        Route::get('/verifications/{verification}', [AdminVerificationController::class, 'show'])->name('verifications.show');
        Route::post('/verifications/{verification}/decision', [AdminVerificationController::class, 'decide'])->name('verifications.decide');
        Route::get('/verifications/{verification}/document', [AdminVerificationController::class, 'document'])->name('verifications.document');

        Route::get('/events', [AdminEventController::class, 'index'])->name('events.index');
        Route::get('/events/{event}', [AdminEventController::class, 'show'])->name('events.show');
        Route::post('/events/{event}/decision', [AdminEventController::class, 'decide'])->name('events.decide');

        Route::get('/sponsorships', [AdminSponsorshipController::class, 'index'])->name('sponsorships.index');
        Route::get('/sponsorships/{sponsorship}', [AdminSponsorshipController::class, 'show'])->name('sponsorships.show');
        Route::post('/sponsorships/{sponsorship}/resolve', [AdminSponsorshipController::class, 'resolve'])->name('sponsorships.resolve');

        Route::get('/reports', [AdminReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/{report}', [AdminReportController::class, 'show'])->name('reports.show');
        Route::put('/reports/{report}', [AdminReportController::class, 'update'])->name('reports.update');

        Route::get('/audit-log', [AdminAuditLogController::class, 'index'])->name('audit-log.index');

        Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
        Route::post('/reviews/{review}/hide', [AdminReviewController::class, 'hide'])->name('reviews.hide');
        Route::post('/reviews/{review}/restore', [AdminReviewController::class, 'restore'])->name('reviews.restore');
    });
