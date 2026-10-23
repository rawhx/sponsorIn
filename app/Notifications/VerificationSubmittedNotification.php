<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pengajuan verifikasi diterima',
            'body' => 'Data usaha Anda sedang menunggu pemeriksaan. Kami akan mengirim kabar setelah proses review selesai.',
            'url' => '/sponsor/verification',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pengajuan verifikasi SponsorIn diterima')
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Pengajuan verifikasi usaha Anda telah kami terima.')
            ->line('Tim verifikasi akan memeriksa data dan dokumen yang Anda kirimkan. Anda dapat mengikuti statusnya di dashboard.')
            ->action('Lihat status verifikasi', url('/sponsor/verification'))
            ->salutation('Salam, SponsorIn');
    }
}
