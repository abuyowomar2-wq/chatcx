<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class AgentsController extends Controller
{
    public function index(): Response
    {
        $tenant = auth()->user()->tenant;

        $agents = Agent::with('user')
            ->where('tenant_id', $tenant->id)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'name' => $a->display_name,
                'email' => $a->user->email,
                'avatar' => $a->avatar_url,
                'status' => $a->status,
                'max_conversations' => $a->max_conversations,
                'active_conversations' => $a->conversations()->whereIn('status', ['active', 'pending'])->count(),
                'created_at' => $a->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Merchant/Agents', [
            'agents' => $agents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = auth()->user()->tenant;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'max_conversations' => 'nullable|integer|min:1|max:50',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'agent',
            'tenant_id' => $tenant->id,
        ]);

        Agent::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'display_name' => $validated['name'],
            'max_conversations' => $validated['max_conversations'] ?? 5,
        ]);

        return back()->with('success', 'تم إضافة الوكيل بنجاح');
    }

    public function destroy(int $id): RedirectResponse
    {
        $tenant = auth()->user()->tenant;
        $agent = Agent::where('tenant_id', $tenant->id)->findOrFail($id);

        $agent->user()->delete();
        $agent->delete();

        return back()->with('success', 'تم حذف الوكيل');
    }
}
