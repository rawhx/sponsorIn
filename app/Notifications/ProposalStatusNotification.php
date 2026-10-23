<?php

namespace App\Notifications;

use App\Enums\ProposalStatus;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProposalStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Proposal $proposal,
        public ProposalStatus $status,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title(),
            'body' => 'Event "'.$this->proposal->event->title.'" — status proposal: '.$this->label().'.',
            'url' => $this->url($notifiable),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->title())
            ->greeting('Halo '.$notifiable->name.',')
            ->line('Ada pembaruan pada proposal untuk event "'.$this->proposal->event->title.'".')
            ->line('Status saat ini: '.$this->label().'.')
            ->action('Buka proposal', url($this->url($notifiable)))
            ->salutation('Salam, SponsorIn');
    }

    private function url(object $notifiable): string
    {
        $prefix = $notifiable->role->value === 'sponsor' ? 'sponsor' : 'eo';

        return "/{$prefix}/proposals/{$this->proposal->id}";
    }

    private function title(): string
    {
        return match ($this->status) {
            ProposalStatus::Sent => 'Proposal baru diterima',
            ProposalStatus::UnderReview => 'Proposal sedang ditinjau',
            ProposalStatus::MoreInformationRequested => 'Proposal memerlukan informasi tambahan',
            ProposalStatus::Negotiation => 'Proposal masuk tahap negosiasi',
            ProposalStatus::Accepted => 'Proposal diterima',
            ProposalStatus::Rejected => 'Proposal ditolak',
            ProposalStatus::Withdrawn => 'Proposal ditarik',
            ProposalStatus::Expired => 'Proposal kedaluwarsa',
            default => 'Pembaruan status proposal',
        };
    }

    private function label(): string
    {
        return match ($this->status) {
            ProposalStatus::Draft => 'Draft',
            ProposalStatus::Sent => 'Terkirim',
            ProposalStatus::UnderReview => 'Sedang ditinjau',
            ProposalStatus::MoreInformationRequested => 'Perlu informasi',
            ProposalStatus::Negotiation => 'Negosiasi',
            ProposalStatus::Accepted => 'Diterima',
            ProposalStatus::Rejected => 'Ditolak',
            ProposalStatus::Withdrawn => 'Ditarik',
            ProposalStatus::Expired => 'Kedaluwarsa',
        };
    }
}
