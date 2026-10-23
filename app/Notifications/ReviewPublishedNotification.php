<?php

namespace App\Notifications;

use App\Models\Review;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewPublishedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Review $review) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Ulasan baru diterima',
            'body' => 'Sponsor memberi rating '.$this->review->overall_rating.'/5 untuk event "'.$this->review->sponsorship->event->title.'".',
            'url' => '/eo/sponsorships/'.$this->review->sponsorship_id,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Ulasan baru diterima')
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Sponsor memberi rating '.$this->review->overall_rating.'/5.')
            ->action('Lihat kerja sama', url('/eo/sponsorships/'.$this->review->sponsorship_id))
            ->salutation('Salam, SponsorIn');
    }
}
