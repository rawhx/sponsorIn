<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventModerationDecisionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $eventTitle,
        public int $eventId,
        public string $status,
        public ?string $publicReason,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title(),
            'body' => $this->publicReason ?? 'Status event "'.$this->eventTitle.'" diperbarui.',
            'url' => '/eo/events/'.$this->eventId,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->title())
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Status event "'.$this->eventTitle.'" telah diperbarui.');

        if ($this->publicReason) {
            $mail->line($this->publicReason);
        }

        if ($this->status === 'published') {
            $mail->line('Event Anda kini tampil pada daftar peluang publik.');
        }

        if ($this->status === 'needs_changes') {
            $mail->line('Silakan perbaiki event sesuai catatan, lalu kirim ulang untuk review.');
        }

        return $mail
            ->action('Buka event', url('/eo/events/'.$this->eventId))
            ->salutation('Salam, SponsorIn');
    }

    private function title(): string
    {
        return match ($this->status) {
            'published' => 'Event disetujui dan terbit',
            'needs_changes' => 'Event perlu perbaikan',
            'rejected' => 'Event ditolak',
            'unpublished' => 'Event diturunkan',
            default => 'Pembaruan status event',
        };
    }
}
