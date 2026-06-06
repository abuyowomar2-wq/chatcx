<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\WidgetSetting;
use App\Services\WidgetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WidgetController extends Controller
{
    public function __construct(
        private WidgetService $widgetService
    ) {}

    public function index(): Response
    {
        $tenant = auth()->user()->tenant;
        $settings = WidgetSetting::firstOrCreate(
            ['tenant_id' => $tenant->id],
            ['title' => 'تحدث معنا', 'subtitle' => 'نحن هنا لمساعدتك', 'welcome_message' => 'مرحباً! كيف يمكننا مساعدتك اليوم؟']
        );

        $embedCode = $this->widgetService->generateEmbedCode($tenant->id, $settings->toArray());

        return Inertia::render('Merchant/WidgetSettings', [
            'settings' => $settings,
            'embedCode' => $embedCode,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $tenant = auth()->user()->tenant;

        $validated = $request->validate([
            'primary_color' => 'required|string|max:7',
            'secondary_color' => 'required|string|max:7',
            'position' => 'required|in:bottom-right,bottom-left',
            'title' => 'required|string|max:255',
            'subtitle' => 'required|string|max:255',
            'welcome_message' => 'required|string|max:500',
            'offline_message' => 'nullable|string|max:500',
            'show_agent_info' => 'boolean',
            'is_active' => 'boolean',
        ]);

        WidgetSetting::updateOrCreate(
            ['tenant_id' => $tenant->id],
            $validated
        );

        return back()->with('success', 'تم تحديث إعدادات widget');
    }
}
