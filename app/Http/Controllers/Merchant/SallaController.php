<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\SallaIntegration;
use App\Services\SallaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SallaController extends Controller
{
    public function __construct(
        private SallaService $sallaService
    ) {}

    public function index(): Response
    {
        $tenant = auth()->user()->tenant;
        $integration = $tenant->sallaIntegration;

        return Inertia::render('Merchant/SallaIntegration', [
            'isConnected' => $integration?->is_connected ?? false,
            'storeData' => $integration?->store_data,
            'authUrl' => $this->sallaService->getAuthorizationUrl(),
        ]);
    }

    public function callback(Request $request): RedirectResponse
    {
        $code = $request->input('code');

        if (!$code) {
            return redirect()->route('merchant.salla')->with('error', 'فشل الاتصال بسلة');
        }

        $tokenData = $this->sallaService->getAccessToken($code);

        if (!$tokenData) {
            return redirect()->route('merchant.salla')->with('error', 'فشل الحصول على توكن سلة');
        }

        $storeInfo = $this->sallaService->getStoreInfo($tokenData['access_token']);

        $tenant = auth()->user()->tenant;

        SallaIntegration::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'salla_store_id' => $storeInfo['id'] ?? '',
                'access_token' => $tokenData['access_token'],
                'refresh_token' => $tokenData['refresh_token'] ?? null,
                'token_expires_at' => $tokenData['expires_in'] ? now()->addSeconds($tokenData['expires_in']) : null,
                'store_data' => $storeInfo,
                'is_connected' => true,
            ]
        );

        return redirect()->route('merchant.salla')->with('success', 'تم ربط متجر سلة بنجاح');
    }

    public function disconnect(): RedirectResponse
    {
        $tenant = auth()->user()->tenant;
        $tenant->sallaIntegration()->delete();

        return redirect()->route('merchant.salla')->with('success', 'تم فصل متجر سلة');
    }
}
