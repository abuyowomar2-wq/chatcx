<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class AgentStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public int $agentId;
    public string $status;
    public int $tenantId;

    public function __construct(int $agentId, string $status, int $tenantId)
    {
        $this->agentId = $agentId;
        $this->status = $status;
        $this->tenantId = $tenantId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('tenant.' . $this->tenantId . '.agents'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'agent_id' => $this->agentId,
            'status' => $this->status,
        ];
    }
}
