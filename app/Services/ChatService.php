<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Contact;
use App\Models\AutoReply;
use App\Events\NewMessage;
use App\Events\ConversationAssigned;

class ChatService
{
    public function createOrGetConversation(int $tenantId, string $contactIdentifier, string $channel = 'widget'): Conversation
    {
        $contact = Contact::where('tenant_id', $tenantId)
            ->where(function ($q) use ($contactIdentifier) {
                $q->where('email', $contactIdentifier)
                  ->orWhere('phone', $contactIdentifier)
                  ->orWhere('whatsapp_id', $contactIdentifier);
            })
            ->first();

        if (!$contact) {
            $contact = Contact::create([
                'tenant_id' => $tenantId,
                'name' => $contactIdentifier,
                'source' => $channel,
            ]);
        }

        $conversation = Conversation::where('tenant_id', $tenantId)
            ->where('contact_id', $contact->id)
            ->where('channel', $channel)
            ->whereIn('status', ['active', 'pending'])
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'tenant_id' => $tenantId,
                'contact_id' => $contact->id,
                'channel' => $channel,
                'status' => 'pending',
            ]);
        }

        return $conversation;
    }

    public function sendMessage(Conversation $conversation, string $body, string $direction = 'incoming', ?int $agentId = null, string $channel = null): Message
    {
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'contact_id' => $conversation->contact_id,
            'agent_id' => $agentId,
            'direction' => $direction,
            'channel' => $channel ?? $conversation->channel,
            'type' => 'text',
            'body' => $body,
        ]);

        $conversation->update([
            'last_message_at' => now(),
            'status' => $direction === 'incoming' && $conversation->status === 'pending' ? 'active' : $conversation->status,
        ]);

        broadcast(new NewMessage($message))->toOthers();

        return $message;
    }

    public function assignAgent(Conversation $conversation, int $agentId): void
    {
        $conversation->update([
            'assigned_agent_id' => $agentId,
            'assigned_at' => now(),
            'status' => 'active',
        ]);

        broadcast(new ConversationAssigned($conversation))->toOthers();
    }

    public function getAutoReply(Conversation $conversation, string $message): ?string
    {
        $tenantId = $conversation->tenant_id;

        $autoReply = AutoReply::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where(function ($q) use ($message) {
                $q->where('trigger_type', 'welcome')
                  ->orWhere('trigger_type', 'keyword');
            })
            ->get()
            ->first(function ($reply) use ($message) {
                if ($reply->trigger_type === 'welcome') {
                    return $conversation->messages()->count() <= 1;
                }
                if ($reply->trigger_type === 'keyword') {
                    return $reply->matchesKeyword($message);
                }
                return false;
            });

        if ($autoReply) {
            return $autoReply->response_message;
        }

        $offHoursReply = AutoReply::where('tenant_id', $tenantId)
            ->where('trigger_type', 'off_hours')
            ->where('is_active', true)
            ->get()
            ->first(fn($reply) => $reply->isOffHours());

        return $offHoursReply?->response_message;
    }

    public function closeConversation(Conversation $conversation): void
    {
        $conversation->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }
}
