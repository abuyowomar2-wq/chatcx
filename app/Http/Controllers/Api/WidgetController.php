<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WidgetController extends Controller
{
    public function __construct(
        private ChatService $chatService
    ) {}

    public function startConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'message' => 'required|string|max:1000',
        ]);

        $contactIdentifier = $validated['email'] ?? $validated['phone'] ?? $validated['name'];

        $conversation = $this->chatService->createOrGetConversation(
            $validated['tenant_id'],
            $contactIdentifier,
            'widget'
        );

        $conversation->contact->update([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? $conversation->contact->email,
            'phone' => $validated['phone'] ?? $conversation->contact->phone,
        ]);

        $message = $this->chatService->sendMessage($conversation, $validated['message'], 'incoming', null, 'widget');

        $autoReply = $this->chatService->getAutoReply($conversation, $validated['message']);

        return response()->json([
            'conversation_id' => $conversation->id,
            'message_id' => $message->id,
            'auto_reply' => $autoReply,
        ]);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'required|string|max:1000',
        ]);

        $conversation = Conversation::findOrFail($validated['conversation_id']);

        $message = $this->chatService->sendMessage($conversation, $validated['message'], 'incoming', null, 'widget');

        $autoReply = $this->chatService->getAutoReply($conversation, $validated['message']);

        return response()->json([
            'message_id' => $message->id,
            'auto_reply' => $autoReply,
        ]);
    }

    public function getMessages(Request $request, int $conversationId): JsonResponse
    {
        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'direction' => $m->direction,
                'type' => $m->type,
                'created_at' => $m->created_at->toISOString(),
            ]);

        return response()->json(['messages' => $messages]);
    }

    public function widgetConfig(Request $request, int $tenantId): JsonResponse
    {
        $settings = \App\Models\WidgetSetting::where('tenant_id', $tenantId)->first();

        if (!$settings || !$settings->is_active) {
            return response()->json(['active' => false]);
        }

        $agents = \App\Models\Agent::where('tenant_id', $tenantId)
            ->where('status', 'online')
            ->get()
            ->map(fn($a) => [
                'name' => $a->display_name,
                'avatar' => $a->avatar_url,
            ]);

        return response()->json([
            'active' => true,
            'primary_color' => $settings->primary_color,
            'secondary_color' => $settings->secondary_color,
            'position' => $settings->position,
            'title' => $settings->title,
            'subtitle' => $settings->subtitle,
            'welcome_message' => $settings->welcome_message,
            'offline_message' => $settings->offline_message,
            'show_agent_info' => $settings->show_agent_info,
            'logo_url' => $settings->logo_url,
            'agents' => $agents,
            'has_online_agents' => $agents->isNotEmpty(),
        ]);
    }

    public function getWidgetJs(): \Illuminate\Http\Response
    {
        $widgetPath = public_path('widget/widget.js');

        if (!file_exists($widgetPath)) {
            return response('// Widget not found', 404, ['Content-Type' => 'application/javascript']);
        }

        return response(file_get_contents($widgetPath), 200, [
            'Content-Type' => 'application/javascript',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
