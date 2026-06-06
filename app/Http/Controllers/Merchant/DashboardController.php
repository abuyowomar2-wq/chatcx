<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $tenant = $user->tenant;

        $stats = [
            'total_conversations' => $tenant->conversations()->count(),
            'active_conversations' => $tenant->conversations()->whereIn('status', ['active', 'pending'])->count(),
            'total_contacts' => $tenant->contacts()->count(),
            'total_agents' => $tenant->agents()->count(),
            'online_agents' => $tenant->agents()->where('status', 'online')->count(),
            'salla_connected' => $tenant->sallaIntegration?->is_connected ?? false,
            'whatsapp_connected' => $tenant->whatsappIntegration?->is_connected ?? false,
        ];

        return Inertia::render('Merchant/Dashboard', [
            'stats' => $stats,
            'storeName' => $tenant->store_name,
        ]);
    }
}


