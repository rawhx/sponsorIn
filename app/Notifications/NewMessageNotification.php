<?php

namespace App\Notifications;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Proposal $proposal,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $prefix = $notifiable->role->value === 'sponsor' ? 'sponsor' : 'eo';

        return [
            'title' => 'Pesan baru',
            'body' => 'Pesan baru pada proposal untuk event "'.$this->proposal->event->title.'".',
            'url' => "/{$prefix}/proposals/{$this->proposal->id}",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pesan baru pada proposal')
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Ada pesan baru pada proposal untuk event "'.$this->proposal->event->title.'".')
            ->action('Baca pesan', url('/sponsor/proposals/'.$this->proposal->id))
            ->salutation('Salam, SponsorIn');
    }
}
