<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\AutoReply;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AutoReplyController extends Controller
{
    public function index(): Response
    {
        $tenant = auth()->user()->tenant;

        return Inertia::render('Merchant/AutoReplies', [
            'autoReplies' => $tenant->autoReplies()->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenant = auth()->user()->tenant;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|in:keyword,off_hours,welcome',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:50',
            'response_message' => 'required|string|max:1000',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'schedule_days' => 'nullable|array',
            'schedule_days.*' => 'integer|between:0,6',
        ]);

        $tenant->autoReplies()->create($validated);

        return back()->with('success', 'تم إضافة الرد التلقائي');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $tenant = auth()->user()->tenant;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|in:keyword,off_hours,welcome',
            'keywords' => 'nullable|array',
            'response_message' => 'required|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $autoReply = AutoReply::where('tenant_id', $tenant->id)->findOrFail($id);
        $autoReply->update($validated);

        return back()->with('success', 'تم تحديث الرد التلقائي');
    }

    public function destroy(int $id): RedirectResponse
    {
        $tenant = auth()->user()->tenant;
        $autoReply = AutoReply::where('tenant_id', $tenant->id)->findOrFail($id);
        $autoReply->delete();

        return back()->with('success', 'تم حذف الرد التلقائي');
    }
}
