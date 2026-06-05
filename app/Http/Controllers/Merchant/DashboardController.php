<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Agent;
use App\Models\User;
use App\Models\WidgetSetting;
use App\Models\AutoReply;
use App\Models\QuickReply;
use App\Models\SallaIntegration;
use App\Models\WhatsAppIntegration;
use App\Services\SallaService;
use App\Services\WidgetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
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

class WhatsAppController extends Controller
{
    public function index(): Response
    {
        $tenant = auth()->user()->tenant;
        $integration = $tenant->whatsappIntegration;

        return Inertia::render('Merchant/WhatsAppIntegration', [
            'isConnected' => $integration?->is_connected ?? false,
            'phoneNumber' => $integration?->phone_number,
            'webhookUrl' => $integration?->is_connected ? route('api.webhook.whatsapp') : null,
            'verifyToken' => config('services.whatsapp.webhook_verify_token'),
        ]);
    }

    public function connect(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone_number_id' => 'required|string',
            'access_token' => 'required|string',
            'phone_number' => 'nullable|string',
        ]);

        $tenant = auth()->user()->tenant;

        WhatsAppIntegration::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'phone_number_id' => $validated['phone_number_id'],
                'access_token' => $validated['access_token'],
                'phone_number' => $validated['phone_number'] ?? null,
                'is_connected' => true,
            ]
        );

        return back()->with('success', 'تم ربط واتساب بنجاح');
    }

    public function disconnect(): RedirectResponse
    {
        $tenant = auth()->user()->tenant;
        $tenant->whatsappIntegration()->delete();

        return redirect()->route('merchant.whatsapp')->with('success', 'تم فصل واتساب');
    }
}

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
