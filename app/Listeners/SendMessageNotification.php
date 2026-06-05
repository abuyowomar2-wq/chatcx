<?php

namespace App\Listeners;

use App\Events\NewMessage;
use Illuminate\Support\Facades\Log;

class SendMessageNotification
{
    public function handle(NewMessage $event): void
    {
        Log::info('New message in conversation', [
            'conversation_id' => $event->message->conversation_id,
            'direction' => $event->message->direction,
        ]);
    }
}
