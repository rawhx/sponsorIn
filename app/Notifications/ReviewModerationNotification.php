<?php

namespace App\Notifications;

use App\Models\Review;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

/**
 * Pemberitahuan in-app saat ulasan disembunyikan atau ditayangkan kembali oleh admin (PRD §10).
 */
class ReviewModerationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Review $review,
        public bool $hidden,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $prefix = $notifiable->role->value === 'sponsor' ? 'sponsor' : 'eo';
        $event = $this->review->sponsorship->event->title;

        return [
            'title' => $this->hidden ? 'Ulasan disembunyikan' : 'Ulasan ditayangkan kembali',
            'body' => $this->hidden
                ? 'Ulasan untuk "'.$event.'" disembunyikan oleh admin karena melanggar kebijakan. Rating publik dihitung ulang.'
                : 'Ulasan untuk "'.$event.'" ditayangkan kembali oleh admin. Rating publik dihitung ulang.',
            'url' => "/{$prefix}/sponsorships/{$this->review->sponsorship_id}",
        ];
    }
}
