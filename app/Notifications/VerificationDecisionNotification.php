<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationDecisionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $status,
        public string $publicReason,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title(),
            'body' => $this->publicReason,
            'url' => '/sponsor/verification',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->title())
            ->greeting('Halo '.$notifiable->name.',')
            ->line($this->publicReason);

        if ($this->status === 'approved') {
            $mail->line('Akun sponsor Anda kini aktif dan fitur penelusuran event sudah dapat digunakan.');
        }

        if ($this->status === 'needs_information') {
            $mail->line('Silakan perbarui data atau dokumen yang diminta, lalu kirim ulang pengajuan.');
        }

        return $mail
            ->action('Buka halaman verifikasi', url('/sponsor/verification'))
            ->salutation('Salam, SponsorIn');
    }

    private function title(): string
    {
        return match ($this->status) {
            'approved' => 'Verifikasi usaha disetujui',
            'needs_information' => 'Verifikasi memerlukan informasi tambahan',
            'rejected' => 'Pengajuan verifikasi belum dapat disetujui',
            default => 'Pembaruan status verifikasi',
        };
    }
}
