<?php

namespace App\Services;

use App\Models\Message;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MessageService
{
    public function post(Proposal $proposal, User $actor, string $body): Message
    {
        $organization = $actor->organization;
        abort_unless($organization && $proposal->isParty($organization), 403);

        $conversation = $proposal->conversation;
        abort_unless($conversation, 404);

        $message = DB::transaction(function () use ($conversation, $actor, $body) {
            $conversation->touch();

            return Message::create([
                'conversation_id' => $conversation->id,
                'sender_user_id' => $actor->id,
                'body' => $body,
            ]);
        });

        // Tandai pesan pihak lain sebagai sudah dibaca.
        $conversation->messages()
            ->where('sender_user_id', '!=', $actor->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $message;
    }

    public function markRead(Proposal $proposal, User $actor): void
    {
        $organization = $actor->organization;
        abort_unless($organization && $proposal->isParty($organization), 403);

        $proposal->conversation?->messages()
            ->where('sender_user_id', '!=', $actor->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
