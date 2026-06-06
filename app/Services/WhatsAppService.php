<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $phoneNumberId;
    private string $accessToken;
    private string $apiVersion;
    private string $baseUrl;

    public function __construct()
    {
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
        $this->accessToken = config('services.whatsapp.access_token');
        $this->apiVersion = config('services.whatsapp.api_version');
        $this->baseUrl = config('services.whatsapp.api_base_url');
    }

    public function initialize(string $phoneNumberId, string $accessToken): void
    {
        $this->phoneNumberId = $phoneNumberId;
        $this->accessToken = $accessToken;
    }

    public function sendText(string $to, string $message): ?array
    {
        return $this->sendMessage([
            'messaging_product' => 'whatsapp',
            'to' => $to,
            'type' => 'text',
            'text' => ['body' => $message],
        ]);
    }

    public function sendTemplate(string $to, string $templateName, array $parameters = []): ?array
    {
        $components = [];

        if (!empty($parameters)) {
            $components[] = [
                'type' => 'body',
                'parameters' => array_map(fn($p) => ['type' => 'text', 'text' => $p], $parameters),
            ];
        }

        return $this->sendMessage([
            'messaging_product' => 'whatsapp',
            'to' => $to,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => 'ar'],
                'components' => $components,
            ],
        ]);
    }

    public function markAsRead(string $messageId): ?array
    {
        return $this->sendMessage([
            'messaging_product' => 'whatsapp',
            'status' => 'read',
            'message_id' => $messageId,
        ]);
    }

    public function verifyWebhook(string $mode, string $token, string $challenge): ?string
    {
        $verifyToken = config('services.whatsapp.webhook_verify_token');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            return $challenge;
        }

        return null;
    }

    public function processWebhook(array $payload): ?array
    {
        if (!isset($payload['entry'][0]['changes'][0]['value'])) {
            return null;
        }

        $value = $payload['entry'][0]['changes'][0]['value'];

        if (isset($value['messages'][0])) {
            $message = $value['messages'][0];
            $contact = $value['contacts'][0] ?? [];

            return [
                'type' => 'message',
                'from' => $message['from'],
                'from_name' => $contact['profile']['name'] ?? 'Unknown',
                'message_id' => $message['id'],
                'timestamp' => $message['timestamp'],
                'body' => $message['text']['body'] ?? '',
                'message_type' => $message['type'] ?? 'text',
            ];
        }

        if (isset($value['statuses'][0])) {
            $status = $value['statuses'][0];
            return [
                'type' => 'status',
                'message_id' => $status['id'],
                'status' => $status['status'],
                'timestamp' => $status['timestamp'],
            ];
        }

        return null;
    }

    private function sendMessage(array $data): ?array
    {
        try {
            $response = Http::withToken($this->accessToken)
                ->post("{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/messages", $data);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('WhatsApp API error: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('WhatsApp API exception: ' . $e->getMessage());
            return null;
        }
    }
}
