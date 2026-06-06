<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppIntegration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppController extends Controller
{
    public function index(): Response
    {
        $tenant = auth()->user()->tenant;
        $integration = $tenant->whatsappIntegration;

        return Inertia::render('Merchant/WhatsAppIntegration', [
            'isConnected' => $integration?->is_connected ?? false,
            'phoneNumber' => $integration?->phone_number,
            'webhookUrl' => $integration?->is_connected ? route('api.webhook.whatsapp') : null,
            'verifyToken' => config('services.whatsapp.webhook_verify_token'),
        ]);
    }

    public function connect(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone_number_id' => 'required|string',
            'access_token' => 'required|string',
            'phone_number' => 'nullable|string',
        ]);

        $tenant = auth()->user()->tenant;

        WhatsAppIntegration::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'phone_number_id' => $validated['phone_number_id'],
                'access_token' => $validated['access_token'],
                'phone_number' => $validated['phone_number'] ?? null,
                'is_connected' => true,
            ]
        );

        return back()->with('success', 'تم ربط واتساب بنجاح');
    }

    public function disconnect(): RedirectResponse
    {
        $tenant = auth()->user()->tenant;
        $tenant->whatsappIntegration()->delete();

        return redirect()->route('merchant.whatsapp')->with('success', 'تم فصل واتساب');
    }
}
