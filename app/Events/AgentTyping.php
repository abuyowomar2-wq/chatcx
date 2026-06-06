<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class AgentTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public int $conversationId;
    public int $agentId;
    public string $agentName;

    public function __construct(int $conversationId, int $agentId, string $agentName)
    {
        $this->conversationId = $conversationId;
        $this->agentId = $agentId;
        $this->agentName = $agentName;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'agent_id' => $this->agentId,
            'agent_name' => $this->agentName,
            'typing' => true,
        ];
    }
}
