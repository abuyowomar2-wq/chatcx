<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Events\NewMessage;
use App\Events\AgentTyping;
use App\Services\ChatService;
use App\Services\WhatsAppService;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function __construct(
        private ChatService $chatService,
        private WhatsAppService $whatsappService,
        private AIService $aiService
    ) {}

    public function show(int $id): Response
    {
        $user = auth()->user();

        $conversation = Conversation::with(['contact', 'messages' => function ($q) {
            $q->orderBy('created_at', 'asc');
        }, 'assignedAgent.user'])
            ->where('tenant_id', $user->tenant_id)
            ->findOrFail($id);

        if ($conversation->status === 'pending') {
            $this->chatService->assignAgent($conversation, $user->agent->id);
        }

        $contact = $conversation->contact;

        $sallaOrders = [];
        if ($conversation->tenant->sallaIntegration && $conversation->tenant->sallaIntegration->is_connected) {
            $sallaService = app(\App\Services\SallaService::class);
            $token = $conversation->tenant->sallaIntegration->access_token;
            if ($contact->phone) {
                $customer = $sallaService->getCustomerByPhone($token, $contact->phone);
                if ($customer) {
                    $orders = $sallaService->getOrders($token, ['customer_id' => $customer['id']]);
                    $sallaOrders = $orders ?? [];
                }
            }
        }

        Message::where('conversation_id', $id)
            ->where('direction', 'incoming')
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return Inertia::render('Agent/Chat', [
            'conversation' => [
                'id' => $conversation->id,
                'contact' => $contact,
                'channel' => $conversation->channel,
                'status' => $conversation->status,
                'subject' => $conversation->subject,
                'salla_order_id' => $conversation->salla_order_id,
                'salla_orders' => $sallaOrders,
            ],
            'messages' => $conversation->messages->map(fn($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'direction' => $m->direction,
                'type' => $m->type,
                'channel' => $m->channel,
                'created_at' => $m->created_at->toISOString(),
                'is_read' => $m->is_read,
            ]),
        ]);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'required|string|max:2000',
        ]);

        $user = auth()->user();
        $conversation = Conversation::where('tenant_id', $user->tenant_id)
            ->findOrFail($validated['conversation_id']);

        $message = $this->chatService->sendMessage(
            $conversation,
            $validated['message'],
            'outgoing',
            $user->agent->id,
            $conversation->channel
        );

        if ($conversation->channel === 'whatsapp' && $conversation->contact->whatsapp_id) {
            $this->whatsappService->sendText(
                $conversation->contact->whatsapp_id,
                $validated['message']
            );
        }

        return response()->json([
            'message' => [
                'id' => $message->id,
                'body' => $message->body,
                'direction' => $message->direction,
                'created_at' => $message->created_at->toISOString(),
            ],
        ]);
    }

    public function typing(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        $user = auth()->user();
        $conversation = Conversation::findOrFail($validated['conversation_id']);

        broadcast(new AgentTyping(
            $conversation->id,
            $user->agent->id,
            $user->agent->display_name
        ));

        return response()->json(['status' => 'ok']);
    }

    public function close(int $id): RedirectResponse
    {
        $user = auth()->user();
        $conversation = Conversation::where('tenant_id', $user->tenant_id)->findOrFail($id);
        $this->chatService->closeConversation($conversation);

        return redirect()->route('agent.inbox');
    }

    public function aiSuggestion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
        ]);

        if (!$this->aiService->isAvailable()) {
            return response()->json(['suggestion' => null]);
        }

        $suggestion = $this->aiService->generateResponse($validated['message']);

        return response()->json(['suggestion' => $suggestion]);
    }
}
