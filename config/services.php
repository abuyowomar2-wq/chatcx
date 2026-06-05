<?php

return [
    'salla' => [
        'client_id' => env('SALLA_CLIENT_ID'),
        'client_secret' => env('SALLA_CLIENT_SECRET'),
        'redirect_uri' => env('SALLA_REDIRECT_URI'),
        'api_base_url' => 'https://api.salla.dev/admin/v2',
        'auth_base_url' => 'https://accounts.salla.sa',
    ],
    'whatsapp' => [
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
        'webhook_verify_token' => env('WHATSAPP_WEBHOOK_VERIFY_TOKEN', 'chatcx_webhook_2024'),
        'api_version' => env('WHATSAPP_API_VERSION', 'v21.0'),
        'api_base_url' => 'https://graph.facebook.com',
    ],
    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'organization' => env('OPENAI_ORGANIZATION'),
    ],
    'chatcx' => [
        'widget_js_url' => env('WIDGET_JS_URL', '/widget/widget.js'),
        'max_upload_size' => env('MAX_UPLOAD_SIZE', 10 * 1024 * 1024),
        'allowed_file_types' => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    ],
];
