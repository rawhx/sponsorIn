<?php

namespace App\Notifications;

use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewEventReviewNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Event $event) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Event menunggu moderasi',
            'body' => 'Event "'.$this->event->title.'" dikirim dan menunggu pemeriksaan.',
            'url' => '/admin/events/'.$this->event->id,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Event baru menunggu moderasi')
            ->line('Sebuah event menunggu pemeriksaan moderasi.')
            ->line('Event: '.$this->event->title)
            ->action('Buka antrean moderasi', url('/admin/events/'.$this->event->id))
            ->salutation('Salam, SponsorIn');
    }
}
