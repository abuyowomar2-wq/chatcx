<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Conversation;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('is_active', true)->count(),
            'total_users' => User::count(),
            'total_agents' => User::where('role', 'agent')->count(),
            'total_conversations' => Conversation::count(),
            'active_conversations' => Conversation::whereIn('status', ['active', 'pending'])->count(),
        ];

        $tenants = Tenant::withCount(['conversations', 'contacts', 'agents'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'store_name' => $t->store_name,
                'email' => $t->email,
                'plan' => $t->plan,
                'is_active' => $t->is_active,
                'conversations_count' => $t->conversations_count,
                'contacts_count' => $t->contacts_count,
                'agents_count' => $t->agents_count,
                'created_at' => $t->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'tenants' => $tenants,
        ]);
    }
}

class TenantController extends Controller
{
    public function index(): Response
    {
        $tenants = Tenant::withCount(['conversations', 'contacts', 'agents'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Admin/Tenants', [
            'tenants' => $tenants,
        ]);
    }
}
