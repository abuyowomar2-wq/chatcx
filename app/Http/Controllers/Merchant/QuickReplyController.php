<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuickReplyController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $tenant = auth()->user()->tenant;

        $validated = $request->validate([
            'shortcut' => 'required|string|max:50',
            'message' => 'required|string|max:1000',
            'category' => 'nullable|string|max:50',
            'is_shared' => 'boolean',
        ]);

        $tenant->quickReplies()->create($validated);

        return back()->with('success', 'تم إضافة الرد السريع');
    }
}
