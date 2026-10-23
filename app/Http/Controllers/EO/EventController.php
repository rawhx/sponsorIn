<?php

namespace App\Http\Controllers\EO;

use App\Enums\AudienceEvidenceType;
use App\Enums\EventStatus;
use App\Enums\SupportType;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use App\Notifications\NewEventReviewNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $status = $request->string('status')->toString();

        $events = $organization->events()
            ->when($status, fn ($query) => $query->where('status', $status))
            ->orderByDesc('updated_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Event $event) => [
                'id' => $event->id,
                'title' => $event->title,
                'category' => $event->category,
                'location' => $event->location,
                'date_start' => $event->date_start->toDateString(),
                'date_end' => $event->date_end?->toDateString(),
                'status' => $event->status->value,
                'moderation_reason_public' => $event->moderation_reason_public,
            ]);

        return Inertia::render('eo/Events', [
            'events' => $events,
            'filters' => ['status' => $status],
            'counts' => [
                'draft' => $organization->events()->where('status', EventStatus::Draft)->count(),
                'under_review' => $organization->events()->where('status', EventStatus::UnderReview)->count(),
                'needs_changes' => $organization->events()->where('status', EventStatus::NeedsChanges)->count(),
                'published' => $organization->events()->where('status', EventStatus::Published)->count(),
                'closed' => $organization->events()->where('status', EventStatus::Closed)->count(),
                'rejected' => $organization->events()->where('status', EventStatus::Rejected)->count(),
            ],
        ]);
    }

    public function show(Request $request, Event $event): Response
    {
        $this->authorizeOwner($request, $event);

        $event->load(['audienceEvidence', 'packages']);

        return Inertia::render('eo/EventDetail', [
            'event' => [
                ...$this->eventPayload($event),
                'evidenceTypes' => $this->evidenceTypes(),
                'supportTypes' => $this->supportTypes(),
            ],
            'canEdit' => $event->status->canBeEdited(),
            'canSubmit' => $event->status->canBeEdited(),
            'canClose' => $event->status === EventStatus::Published,
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()->organization, 404);

        return Inertia::render('eo/EventForm', [
            'event' => null,
            'audienceEvidenceTypes' => $this->evidenceTypes(),
            'supportTypes' => $this->supportTypes(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $organization = $request->user()->organization;
        abort_unless($organization, 404);

        $data = $this->validated($request);

        $event = $organization->events()->create([
            ...$data,
            'status' => EventStatus::Draft,
        ]);

        return redirect()
            ->route('eo.events.show', $event)
            ->with('success', 'Event berhasil disimpan sebagai draft.');
    }

    public function edit(Request $request, Event $event): Response
    {
        $this->authorizeOwner($request, $event);
        abort_unless($event->status->canBeEdited(), 403, 'Event ini sedang dalam proses moderasi dan belum dapat diubah.');

        $event->load(['audienceEvidence', 'packages']);

        return Inertia::render('eo/EventForm', [
            'event' => $this->eventPayload($event),
            'audienceEvidenceTypes' => $this->evidenceTypes(),
            'supportTypes' => $this->supportTypes(),
        ]);
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($event->status->canBeEdited(), 403, 'Event ini sedang dalam proses moderasi dan belum dapat diubah.');

        $event->update($this->validated($request));

        return redirect()
            ->route('eo.events.show', $event)
            ->with('success', 'Perubahan event disimpan.');
    }

    public function submit(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($event->status->canBeEdited(), 403, 'Event ini tidak dapat dikirim untuk review saat ini.');

        if ($event->audienceEvidence()->count() === 0) {
            return back()->with('error', 'Tambahkan minimal satu bukti audiens sebelum mengirim event untuk review.');
        }

        $event->update([
            'status' => EventStatus::UnderReview,
            'moderation_reason_public' => null,
            'moderation_reason_internal' => null,
        ]);

        $staff = User::query()
            ->whereIn('role', ['admin', 'verifier'])
            ->where('account_status', 'active')
            ->get();

        Notification::send($staff, new NewEventReviewNotification($event));

        return redirect()
            ->route('eo.events.show', $event)
            ->with('success', 'Event dikirim untuk review admin.');
    }

    public function close(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeOwner($request, $event);
        abort_unless($event->status === EventStatus::Published, 403, 'Hanya event terbit yang dapat ditutup.');

        $event->update(['status' => EventStatus::Closed]);

        return redirect()
            ->route('eo.events.show', $event)
            ->with('success', 'Event ditutup. Peluang baru tidak lagi ditampilkan.');
    }

    private function authorizeOwner(Request $request, Event $event): void
    {
        abort_unless($event->eo_organization_id === $request->user()->organization?->id, 403);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'category' => ['required', 'string', 'max:80'],
            'format' => ['required', 'string', 'max:40'],
            'date_start' => ['required', 'date'],
            'date_end' => ['nullable', 'date', 'after_or_equal:date_start'],
            'location' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:5000'],
            'audience_profile' => ['nullable', 'string', 'max:3000'],
            'capacity_estimate' => ['nullable', 'integer', 'min:1', 'max:10000000'],
            'support_needs' => ['nullable', 'string', 'max:2000'],
        ]);

        return $data;
    }

    private function eventPayload(Event $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'slug' => $event->slug,
            'category' => $event->category,
            'format' => $event->format,
            'date_start' => $event->date_start->toDateString(),
            'date_end' => $event->date_end?->toDateString(),
            'location' => $event->location,
            'description' => $event->description,
            'audience_profile' => $event->audience_profile,
            'capacity_estimate' => $event->capacity_estimate,
            'support_needs' => $event->support_needs,
            'status' => $event->status->value,
            'moderation_reason_public' => $event->moderation_reason_public,
            'evidence' => $event->audienceEvidence->map(fn ($evidence) => [
                'id' => $evidence->id,
                'type' => $evidence->evidence_type->value,
                'value' => $evidence->value,
                'unit' => $evidence->unit,
                'period' => $evidence->period,
                'source' => $evidence->source_description,
                'note' => $evidence->evidence_note,
                'verification_status' => $evidence->verification_status->value,
            ]),
            'packages' => $event->packages->map(fn ($package) => [
                'id' => $package->id,
                'name' => $package->name,
                'support_type' => $package->support_type->value,
                'price_amount' => $package->price_amount,
                'currency' => $package->currency,
                'benefits' => $package->benefits,
                'deliverables' => $package->deliverables,
                'availability_status' => $package->availability_status->value,
                'notes' => $package->notes,
            ]),
        ];
    }

    private function evidenceTypes(): array
    {
        return collect(AudienceEvidenceType::cases())->map(fn ($type) => [
            'value' => $type->value,
            'label' => match ($type) {
                AudienceEvidenceType::Projection => 'Proyeksi',
                AudienceEvidenceType::Registration => 'Registrasi',
                AudienceEvidenceType::TicketsSold => 'Tiket terjual',
                AudienceEvidenceType::CheckIn => 'Check-in',
                AudienceEvidenceType::PastEvent => 'Event sebelumnya',
                AudienceEvidenceType::CommunityReach => 'Jangkauan komunitas',
            },
        ])->values()->all();
    }

    private function supportTypes(): array
    {
        return collect(SupportType::cases())->map(fn ($type) => [
            'value' => $type->value,
            'label' => match ($type) {
                SupportType::Cash => 'Dana tunai',
                SupportType::Product => 'Produk',
                SupportType::Service => 'Layanan',
                SupportType::Media => 'Media',
                SupportType::Other => 'Lainnya',
            },
        ])->values()->all();
    }
}
