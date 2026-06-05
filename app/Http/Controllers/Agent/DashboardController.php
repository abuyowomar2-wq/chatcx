<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\QuickReply;
use App\Models\Agent;
use App\Events\AgentStatusChanged;
use App\Events\AgentTyping;
use App\Services\ChatService;
use App\Services\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private ChatService $chatService,
        private WhatsAppService $whatsappService
    ) {}

    public function index(): Response
    {
        $user = auth()->user();
        $agent = $user->agent;

        $conversations = Conversation::with(['contact', 'lastMessage', 'assignedAgent.user'])
            ->where('tenant_id', $user->tenant_id)
            ->whereIn('status', ['active', 'pending'])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'contact_name' => $c->contact->name ?? 'عميل',
                'contact_phone' => $c->contact->phone,
                'contact_avatar' => $c->contact->avatar_url,
                'channel' => $c->channel,
                'status' => $c->status,
                'subject' => $c->subject,
                'unread' => $c->unreadCount(),
                'last_message' => $c->lastMessage?->body,
                'last_message_at' => $c->lastMessage?->created_at?->diffForHumans(),
                'assigned_agent_name' => $c->assignedAgent?->display_name,
                'salla_order_id' => $c->salla_order_id,
            ]);

        $agentStatus = $agent?->status ?? 'offline';
        $agentMaxConversations = $agent?->max_conversations ?? 5;
        $activeCount = $conversations->where('status', 'active')->count();

        return Inertia::render('Agent/Inbox', [
            'conversations' => $conversations,
            'agentStatus' => $agentStatus,
            'activeCount' => $activeCount,
            'maxConversations' => $agentMaxConversations,
            'quickReplies' => QuickReply::where('tenant_id', $user->tenant_id)
                ->where(function ($q) use ($agent) {
                    $q->where('is_shared', true)->orWhere('agent_id', $agent?->id);
                })->get(),
        ]);
    }

    public function updateStatus(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:online,away,busy,offline',
        ]);

        $agent = auth()->user()->agent;
        if ($agent) {
            $agent->update(['status' => $validated['status']]);
            broadcast(new AgentStatusChanged($agent->id, $validated['status'], $agent->tenant_id));
        }

        return back();
    }
}
