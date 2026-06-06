<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SallaService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;
    private string $apiBaseUrl;
    private string $authBaseUrl;

    public function __construct()
    {
        $this->clientId = config('services.salla.client_id');
        $this->clientSecret = config('services.salla.client_secret');
        $this->redirectUri = config('services.salla.redirect_uri');
        $this->apiBaseUrl = config('services.salla.api_base_url');
        $this->authBaseUrl = config('services.salla.auth_base_url');
    }

    public function getAuthorizationUrl(): string
    {
        return $this->authBaseUrl . '/oauth2/auth?' . http_build_query([
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => 'offline_access stores.info orders.read customers.read',
        ]);
    }

    public function getAccessToken(string $code): ?array
    {
        try {
            $response = Http::post($this->authBaseUrl . '/oauth2/token', [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $this->redirectUri,
                'code' => $code,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Salla token error: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Salla token exception: ' . $e->getMessage());
            return null;
        }
    }

    public function refreshAccessToken(string $refreshToken): ?array
    {
        try {
            $response = Http::post($this->authBaseUrl . '/oauth2/token', [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Salla refresh token error: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Salla refresh token exception: ' . $e->getMessage());
            return null;
        }
    }

    public function getStoreInfo(string $accessToken): ?array
    {
        try {
            $response = Http::withToken($accessToken)
                ->get($this->apiBaseUrl . '/store/info');

            if ($response->successful()) {
                return $response->json()['data'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Salla store info exception: ' . $e->getMessage());
            return null;
        }
    }

    public function getOrders(string $accessToken, array $params = []): ?array
    {
        try {
            $response = Http::withToken($accessToken)
                ->get($this->apiBaseUrl . '/orders', $params);

            if ($response->successful()) {
                return $response->json()['data'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Salla orders exception: ' . $e->getMessage());
            return null;
        }
    }

    public function getCustomerByPhone(string $accessToken, string $phone): ?array
    {
        try {
            $response = Http::withToken($accessToken)
                ->get($this->apiBaseUrl . '/customers', ['phone' => $phone]);

            if ($response->successful()) {
                $customers = $response->json()['data'] ?? [];
                return $customers[0] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Salla customer lookup exception: ' . $e->getMessage());
            return null;
        }
    }
}
