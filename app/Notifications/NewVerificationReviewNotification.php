<?php

namespace App\Notifications;

use App\Models\SponsorVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewVerificationReviewNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public SponsorVerification $verification) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pengajuan verifikasi baru',
            'body' => 'Ada pengajuan verifikasi sponsor yang menunggu pemeriksaan.',
            'url' => '/admin/verifications/'.$this->verification->id,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pengajuan verifikasi sponsor baru')
            ->line('Sebuah pengajuan verifikasi sponsor menunggu pemeriksaan.')
            ->action('Buka antrean verifikasi', url('/admin/verifications/'.$this->verification->id))
            ->salutation('Salam, SponsorIn');
    }
}
