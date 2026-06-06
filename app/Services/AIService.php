<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private ?string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
    }

    public function isAvailable(): bool
    {
        return !empty($this->apiKey);
    }

    public function generateResponse(string $message, array $context = []): ?string
    {
        if (!$this->isAvailable()) {
            return null;
        }

        try {
            $systemPrompt = "أنت مساعد خدمة عملاء لموقع تجاري. ردودك تكون مختصرة ومفيدة وباللغة العربية الفصحى.";
            $systemPrompt .= "إذا كان السؤال عن طلب أو منتج، اطلب من العميل رقم الطلب للمساعدة.";

            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
            ];

            if (!empty($context)) {
                $messages[] = ['role' => 'system', 'content' => "سياق المحادثة: " . json_encode($context)];
            }

            $messages[] = ['role' => 'user', 'content' => $message];

            $response = Http::withToken($this->apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-3.5-turbo',
                    'messages' => $messages,
                    'max_tokens' => 200,
                    'temperature' => 0.7,
                ]);

            if ($response->successful()) {
                return $response->json()['choices'][0]['message']['content'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('AI service exception: ' . $e->getMessage());
            return null;
        }
    }

    public function classifyIntent(string $message): string
    {
        if (!$this->isAvailable()) {
            return 'general';
        }

        $keywords = [
            'order' => ['طلب', 'اوردر', 'شحنة', 'توصيل', 'طلبتي'],
            'complaint' => ['شكوى', 'مشكلة', 'سيء', 'تأخر', 'خطأ'],
            'return' => ['رجوع', 'استرجاع', 'تبديل', 'مرتجع'],
            'inquiry' => ['سعر', 'كم', 'متى', 'هل', 'كيف', 'عندكم'],
        ];

        foreach ($keywords as $intent => $words) {
            foreach ($words as $word) {
                if (str_contains(mb_strtolower($message), mb_strtolower($word))) {
                    return $intent;
                }
            }
        }

        return 'general';
    }
}
