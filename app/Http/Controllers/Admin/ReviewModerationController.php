<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewModerationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $query = Review::query()->with(['sponsorship.event', 'sponsorship.eoOrganization', 'sponsorship.sponsorOrganization']);

        if ($request->filled('status')) {
            $query->where('status', $filters['status']);
        }

        if ($request->filled('q')) {
            $term = $filters['q'];
            $query->where(function ($q) use ($term) {
                $q->where('comment', 'like', "%{$term}%")
                    ->orWhereHas('sponsorship.event', fn ($eq) => $eq->where('title', 'like', "%{$term}%"))
                    ->orWhereHas('sponsorship.eoOrganization', fn ($oq) => $oq->where('display_name', 'like', "%{$term}%"));
            });
        }

        $reviews = $query->latest('submitted_at')->paginate(15)->withQueryString()
            ->through(fn (Review $review) => [
                'id' => $review->id,
                'event_title' => $review->sponsorship->event->title,
                'eo' => $review->sponsorship->eoOrganization->display_name,
                'sponsor' => $review->sponsorship->sponsorOrganization->display_name,
                'overall_rating' => $review->overall_rating,
                'comment' => $review->comment,
                'status' => $review->status->value,
                'submitted_at' => $review->submitted_at?->toISOString(),
                'hidden_reason' => $review->status === ReviewStatus::Hidden ? $review->hidden_reason : null,
            ]);

        return Inertia::render('admin/Reviews', [
            'reviews' => $reviews,
            'filters' => [
                'status' => $request->string('status')->toString(),
                'q' => $request->string('q')->toString(),
            ],
            'counts' => [
                'published' => Review::where('status', ReviewStatus::Published)->count(),
                'hidden' => Review::where('status', ReviewStatus::Hidden)->count(),
            ],
        ]);
    }

    public function hide(Request $request, Review $review, ReviewService $service): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $service->hide($review, $request->user(), $data['reason']);

        return back()->with('success', 'Ulasan disembunyikan.');
    }

    public function restore(Request $request, Review $review, ReviewService $service): RedirectResponse
    {
        $service->recalculate($review->sponsorship->eoOrganization);

        $review->forceFill([
            'status' => ReviewStatus::Published,
            'hidden_reason' => null,
            'published_at' => $review->published_at ?? now(),
        ])->save();

        $service->recalculate($review->sponsorship->eoOrganization);

        return back()->with('success', 'Ulasan ditayangkan kembali.');
    }
}
