<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SallaIntegration;
use App\Models\Conversation;
use App\Models\Contact;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private ChatService $chatService
    ) {}

    public function salla(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('Salla webhook received', ['payload' => $payload]);

        $event = $payload['event'] ?? '';
        $data = $payload['data'] ?? [];

        switch ($event) {
            case 'order.created':
                $this->handleSallaOrderCreated($data);
                break;
            case 'order.updated':
                $this->handleSallaOrderUpdated($data);
                break;
            default:
                break;
        }

        return response()->json(['status' => 'received']);
    }

    public function whatsapp(Request $request): \Illuminate\Http\Response
    {
        $mode = $request->input('hub_mode');
        $token = $request->input('hub_verify_token');
        $challenge = $request->input('hub_challenge');

        if ($mode && $token && $challenge) {
            $whatsappService = app(\App\Services\WhatsAppService::class);
            $result = $whatsappService->verifyWebhook($mode, $token, $challenge);

            if ($result) {
                return response($result, 200)->header('Content-Type', 'text/plain');
            }
        }

        $payload = $request->all();
        $this->handleWhatsAppMessage($payload);

        return response('OK', 200);
    }

    private function handleSallaOrderCreated(array $data): void
    {
        $storeId = $data['store_id'] ?? null;
        if (!$storeId) return;

        $integration = SallaIntegration::where('salla_store_id', $storeId)->first();
        if (!$integration) return;

        $customerPhone = $data['customer']['phone'] ?? null;
        $customerName = $data['customer']['first_name'] ?? 'عميل';
        $orderId = $data['reference_id'] ?? $data['id'] ?? '';

        if (!$customerPhone) return;

        $conversation = $this->chatService->createOrGetConversation(
            $integration->tenant_id,
            $customerPhone,
            'salla'
        );

        $conversation->contact->update([
            'name' => $customerName,
            'salla_customer_id' => $data['customer']['id'] ?? null,
        ]);

        $conversation->update([
            'salla_order_id' => $orderId,
            'subject' => "طلب جديد #{$orderId}",
        ]);

        $this->chatService->sendMessage(
            $conversation,
            "تم إنشاء طلب جديد #{$orderId}. شكراً لطلبك!",
            'outgoing',
            null,
            'salla'
        );
    }

    private function handleSallaOrderUpdated(array $data): void
    {
        $storeId = $data['store_id'] ?? null;
        if (!$storeId) return;

        $integration = SallaIntegration::where('salla_store_id', $storeId)->first();
        if (!$integration) return;

        $orderId = $data['reference_id'] ?? $data['id'] ?? '';
        $status = $data['status']['name'] ?? '';

        $conversation = Conversation::where('salla_order_id', $orderId)
            ->where('tenant_id', $integration->tenant_id)
            ->first();

        if ($conversation) {
            $this->chatService->sendMessage(
                $conversation,
                "تم تحديث حالة الطلب #{$orderId}: {$status}",
                'outgoing',
                null,
                'salla'
            );
        }
    }

    private function handleWhatsAppMessage(array $payload): void
    {
        $whatsappService = app(\App\Services\WhatsAppService::class);
        $result = $whatsappService->processWebhook($payload);

        if (!$result || $result['type'] !== 'message') return;

        $whatsappId = $result['from'];
        $messageBody = $result['body'];
        $fromName = $result['from_name'];

        $integration = \App\Models\WhatsAppIntegration::where('phone_number_id', config('services.whatsapp.phone_number_id'))
            ->orWhereHas('tenant', function ($q) use ($whatsappId) {
                // This is simplified - in production you'd have proper routing
            })
            ->first();

        if (!$integration) return;

        $contact = Contact::firstOrCreate(
            ['tenant_id' => $integration->tenant_id, 'whatsapp_id' => $whatsappId],
            ['name' => $fromName, 'phone' => $whatsappId, 'source' => 'whatsapp']
        );

        $conversation = Conversation::firstOrCreate(
            ['tenant_id' => $integration->tenant_id, 'contact_id' => $contact->id, 'channel' => 'whatsapp', 'status' => 'active'],
            ['status' => 'pending']
        );

        if ($conversation->wasRecentlyCreated) {
            $conversation->update(['status' => 'active']);
        }

        $this->chatService->sendMessage($conversation, $messageBody, 'incoming', null, 'whatsapp');

        $whatsappService->markAsRead($result['message_id']);

        $autoReply = $this->chatService->getAutoReply($conversation, $messageBody);
        if ($autoReply) {
            $this->chatService->sendMessage($conversation, $autoReply, 'outgoing', null, 'whatsapp');
            $whatsappService->sendText($whatsappId, $autoReply);
        }
    }
}
