<?php

namespace App\Listeners;

use App\Events\ConversationAssigned;
use Illuminate\Support\Facades\Log;

class NotifyAgentAssignment
{
    public function handle(ConversationAssigned $event): void
    {
        Log::info('Conversation assigned to agent', [
            'conversation_id' => $event->conversation->id,
            'agent_id' => $event->conversation->assigned_agent_id,
        ]);
    }
}
