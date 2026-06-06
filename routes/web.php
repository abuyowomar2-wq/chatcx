<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Agent\DashboardController as AgentDashboardController;
use App\Http\Controllers\Agent\ConversationController as AgentConversationController;
use App\Http\Controllers\Merchant\DashboardController as MerchantDashboardController;
use App\Http\Controllers\Merchant\SettingsController;
use App\Http\Controllers\Merchant\AgentsController;
use App\Http\Controllers\Merchant\WidgetController;
use App\Http\Controllers\Merchant\SallaController;
use App\Http\Controllers\Merchant\WhatsAppController;
use App\Http\Controllers\Merchant\AutoReplyController;
use App\Http\Controllers\Merchant\QuickReplyController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\TenantController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('merchant.dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/tenants', [TenantController::class, 'index'])->name('tenants');
    });

    Route::middleware(['role:merchant'])->prefix('merchant')->name('merchant.')->group(function () {
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
        Route::post('/settings', [SettingsController::class, 'update']);
    });

    Route::middleware(['role:merchant', 'tenant'])->prefix('merchant')->name('merchant.')->group(function () {
        Route::get('/dashboard', [MerchantDashboardController::class, 'index'])->name('dashboard');

        Route::get('/agents', [AgentsController::class, 'index'])->name('agents');
        Route::post('/agents', [AgentsController::class, 'store']);
        Route::delete('/agents/{id}', [AgentsController::class, 'destroy'])->name('agents.destroy');

        Route::get('/widget', [WidgetController::class, 'index'])->name('widget');
        Route::post('/widget', [WidgetController::class, 'update']);

        Route::get('/salla', [SallaController::class, 'index'])->name('salla');
        Route::get('/salla/callback', [SallaController::class, 'callback'])->name('salla.callback');
        Route::post('/salla/disconnect', [SallaController::class, 'disconnect'])->name('salla.disconnect');

        Route::get('/whatsapp', [WhatsAppController::class, 'index'])->name('whatsapp');
        Route::post('/whatsapp/connect', [WhatsAppController::class, 'connect'])->name('whatsapp.connect');
        Route::post('/whatsapp/disconnect', [WhatsAppController::class, 'disconnect'])->name('whatsapp.disconnect');

        Route::get('/auto-replies', [AutoReplyController::class, 'index'])->name('auto-replies');
        Route::post('/auto-replies', [AutoReplyController::class, 'store']);
        Route::put('/auto-replies/{id}', [AutoReplyController::class, 'update'])->name('auto-replies.update');
        Route::delete('/auto-replies/{id}', [AutoReplyController::class, 'destroy'])->name('auto-replies.destroy');

        Route::post('/quick-replies', [QuickReplyController::class, 'store'])->name('quick-replies.store');
    });

    Route::middleware(['role:agent', 'tenant'])->prefix('agent')->name('agent.')->group(function () {
        Route::get('/inbox', [AgentDashboardController::class, 'index'])->name('inbox');
        Route::post('/status', [AgentDashboardController::class, 'updateStatus'])->name('status');
        Route::get('/conversations/{id}', [AgentConversationController::class, 'show'])->name('conversations.show');
        Route::post('/conversations/message', [AgentConversationController::class, 'sendMessage'])->name('conversations.message');
        Route::post('/conversations/typing', [AgentConversationController::class, 'typing'])->name('conversations.typing');
        Route::post('/conversations/{id}/close', [AgentConversationController::class, 'close'])->name('conversations.close');
        Route::post('/conversations/ai-suggest', [AgentConversationController::class, 'aiSuggestion'])->name('conversations.ai-suggest');
    });
});
