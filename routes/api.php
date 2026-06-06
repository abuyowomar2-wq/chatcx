<?php

use App\Http\Controllers\Api\WidgetController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('widget')->group(function () {
    Route::post('/start', [WidgetController::class, 'startConversation']);
    Route::post('/message', [WidgetController::class, 'sendMessage']);
    Route::get('/messages/{conversationId}', [WidgetController::class, 'getMessages']);
    Route::get('/config/{tenantId}', [WidgetController::class, 'widgetConfig']);
    Route::get('/widget.js', [WidgetController::class, 'getWidgetJs'])->name('widget.js');
});

Route::prefix('webhook')->group(function () {
    Route::post('/salla', [WebhookController::class, 'salla'])->name('webhook.salla');
    Route::match(['get', 'post'], '/whatsapp', [WebhookController::class, 'whatsapp'])->name('webhook.whatsapp');
});

Route::middleware('auth:sanctum')->get('/user', function () {
    return request()->user();
});
