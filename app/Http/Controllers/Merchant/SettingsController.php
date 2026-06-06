<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $tenant = auth()->user()->tenant;

        return Inertia::render('Merchant/Settings', [
            'tenant' => $tenant->only(['store_name', 'email', 'phone', 'plan']),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $tenant = auth()->user()->tenant;
        $tenant->update($validated);

        return back()->with('success', 'تم تحديث الإعدادات بنجاح');
    }
}
