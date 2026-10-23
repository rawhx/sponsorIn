<?php

namespace App\Notifications;

use App\Enums\SponsorshipStatus;
use App\Models\Sponsorship;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SponsorshipStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Sponsorship $sponsorship,
        public SponsorshipStatus $status,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        $prefix = $notifiable->role->value === 'sponsor' ? 'sponsor' : 'eo';

        return [
            'title' => $this->title(),
            'body' => 'Event "'.$this->sponsorship->event->title.'" — status kerja sama: '.$this->label().'.',
            'url' => "/{$prefix}/sponsorships/{$this->sponsorship->id}",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $prefix = $notifiable->role->value === 'sponsor' ? 'sponsor' : 'eo';

        return (new MailMessage)
            ->subject($this->title())
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Ada pembaruan pada kerja sama untuk event "'.$this->sponsorship->event->title.'".')
            ->line('Status saat ini: '.$this->label().'.')
            ->action('Lihat kerja sama', url("/{$prefix}/sponsorships/{$this->sponsorship->id}"))
            ->salutation('Salam, SponsorIn');
    }

    private function title(): string
    {
        return match ($this->status) {
            SponsorshipStatus::Active => 'Kerja sama aktif',
            SponsorshipStatus::CompletionRequested => 'Permintaan penyelesaian',
            SponsorshipStatus::Completed => 'Kerja sama selesai',
            SponsorshipStatus::Disputed => 'Sengketa diajukan',
            SponsorshipStatus::NeedsAdminReview => 'Penyelesaian menunggu admin',
            SponsorshipStatus::Cancelled => 'Kerja sama dibatalkan',
        };
    }

    private function label(): string
    {
        return match ($this->status) {
            SponsorshipStatus::Active => 'Aktif',
            SponsorshipStatus::CompletionRequested => 'Menunggu konfirmasi penyelesaian',
            SponsorshipStatus::Completed => 'Selesai',
            SponsorshipStatus::Disputed => 'Sengketa',
            SponsorshipStatus::NeedsAdminReview => 'Menunggu peninjauan admin',
            SponsorshipStatus::Cancelled => 'Dibatalkan',
        };
    }
}
