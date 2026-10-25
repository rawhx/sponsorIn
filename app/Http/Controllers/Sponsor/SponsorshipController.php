<?php

namespace App\Http\Controllers\Sponsor;

use App\Enums\SponsorshipStatus;
use App\Http\Controllers\Concerns\FormatsSponsorships;
use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\Sponsorship;
use App\Notifications\ReviewPublishedNotification;
use App\Notifications\SponsorshipStatusNotification;
use App\Services\ReviewService;
use App\Services\SponsorshipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SponsorshipController extends Controller
{
    use FormatsSponsorships;

    public function index(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $filters = $request->validate([
            'status' => ['nullable', 'string'],
        ]);

        $query = Sponsorship::query()
            ->where('sponsor_org_id', $organization->id)
            ->with(['event', 'sponsorOrganization', 'eoOrganization', 'review']);

        if ($request->filled('status')) {
            $query->where('status', $filters['status']);
        }

        $sponsorships = $query->latest('updated_at')->paginate(12)->withQueryString()
            ->through(fn (Sponsorship $sponsorship) => $this->sponsorshipSummary($sponsorship, $organization));

        return Inertia::render('sponsor/Sponsorships', [
            'sponsorships' => $sponsorships,
            'filters' => ['status' => $request->string('status')->toString()],
            'statuses' => $this->sponsorshipStatusOptions(),
            'counts' => [
                'active' => Sponsorship::where('sponsor_org_id', $organization->id)->where('status', SponsorshipStatus::Active)->count(),
                'pending' => Sponsorship::where('sponsor_org_id', $organization->id)->where('status', SponsorshipStatus::CompletionRequested)->count(),
                'completed' => Sponsorship::where('sponsor_org_id', $organization->id)->where('status', SponsorshipStatus::Completed)->count(),
            ],
        ]);
    }

    public function show(Request $request, Sponsorship $sponsorship): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization && $sponsorship->isParty($organization), 403);
        abort_unless($sponsorship->sponsor_org_id === $organization->id, 403);

        $sponsorship->load(['event', 'sponsorOrganization', 'eoOrganization', 'review']);

        return Inertia::render('sponsor/SponsorshipDetail', [
            'sponsorship' => $this->sponsorshipDetail($sponsorship, $organization),
        ]);
    }

    /**
     * Konfirmasi ringkasan kesepakatan. Sponsorship baru dibuat setelah sponsor dan EO sama-sama mengonfirmasi.
     */
    public function store(Proposal $proposal, Request $request, SponsorshipService $service): RedirectResponse
    {
        $alreadyExisted = $proposal->sponsorship()->exists();

        $sponsorship = $service->confirmAgreement($proposal, $request->user());

        if (! $sponsorship) {
            return back()->with('success', 'Konfirmasi Anda tercatat. Menunggu konfirmasi dari EO.');
        }

        if (! $alreadyExisted) {
            $sponsorship->eoOrganization->owner?->notify(new SponsorshipStatusNotification($sponsorship, SponsorshipStatus::Active));
        }

        return redirect()
            ->route('sponsor.sponsorships.show', $sponsorship)
            ->with('success', 'Kesepakatan dikonfirmasi kedua pihak dan dicatat sebagai sponsorship aktif.');
    }

    public function cancel(Sponsorship $sponsorship, Request $request, SponsorshipService $service): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $service->cancel($sponsorship, $request->user(), $data['reason']);

        $sponsorship->eoOrganization->owner?->notify(
            new SponsorshipStatusNotification($sponsorship, SponsorshipStatus::Cancelled)
        );

        return back()->with('success', 'Kerja sama dibatalkan.');
    }

    public function requestCompletion(Sponsorship $sponsorship, Request $request, SponsorshipService $service): RedirectResponse
    {
        $service->requestCompletion($sponsorship, $request->user());

        $sponsorship->eoOrganization->owner?->notify(
            new SponsorshipStatusNotification($sponsorship, SponsorshipStatus::CompletionRequested)
        );

        return back()->with('success', 'Permintaan penyelesaian dikirim ke EO.');
    }

    public function confirmCompletion(Sponsorship $sponsorship, Request $request, SponsorshipService $service): RedirectResponse
    {
        $service->confirmCompletion($sponsorship, $request->user());

        $sponsorship->eoOrganization->owner?->notify(
            new SponsorshipStatusNotification($sponsorship, SponsorshipStatus::Completed)
        );

        return back()->with('success', 'Kerja sama ditandai selesai.');
    }

    public function raiseDispute(Sponsorship $sponsorship, Request $request, SponsorshipService $service): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $service->raiseDispute($sponsorship, $request->user(), $data['reason']);

        $sponsorship->eoOrganization->owner?->notify(
            new SponsorshipStatusNotification($sponsorship, SponsorshipStatus::Disputed)
        );

        return back()->with('success', 'Sengketa diajukan untuk peninjauan.');
    }

    public function storeReview(Sponsorship $sponsorship, Request $request, ReviewService $service): RedirectResponse
    {
        $data = $this->validateReview($request);

        $review = $service->create($sponsorship, $request->user(), $data);

        $sponsorship->eoOrganization->owner?->notify(new ReviewPublishedNotification($review));

        return back()->with('success', 'Ulasan Anda sudah ditayangkan.');
    }

    public function updateReview(Sponsorship $sponsorship, Request $request, ReviewService $service): RedirectResponse
    {
        $review = $sponsorship->review;
        abort_unless($review, 404);

        $data = $this->validateReview($request);
        $service->update($review, $request->user(), $data);

        return back()->with('success', 'Ulasan diperbarui.');
    }

    private function validateReview(Request $request): array
    {
        return $request->validate([
            'overall_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'communication_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'professionalism_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'deliverables_rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
