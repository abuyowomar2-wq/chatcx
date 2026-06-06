<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Inertia\Inertia;
use Inertia\Response;

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
