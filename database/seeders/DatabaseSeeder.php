<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Agent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'مدير النظام',
            'email' => 'admin@chatcx.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $tenant = Tenant::create([
            'store_name' => 'متجري التجريبي',
            'email' => 'merchant@chatcx.com',
            'phone' => '966500000000',
            'plan' => 'free',
        ]);

        $user = User::create([
            'name' => 'التاجر',
            'email' => 'merchant@chatcx.com',
            'password' => Hash::make('merchant123'),
            'role' => 'merchant',
            'tenant_id' => $tenant->id,
        ]);

        Agent::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'display_name' => 'التاجر',
            'status' => 'online',
        ]);

        $agentUser = User::create([
            'name' => 'وكيل 1',
            'email' => 'agent@chatcx.com',
            'password' => Hash::make('agent123'),
            'role' => 'agent',
            'tenant_id' => $tenant->id,
        ]);

        Agent::create([
            'tenant_id' => $tenant->id,
            'user_id' => $agentUser->id,
            'display_name' => 'وكيل 1',
            'status' => 'online',
        ]);

        \App\Models\WidgetSetting::create([
            'tenant_id' => $tenant->id,
            'primary_color' => '#0ea5e9',
            'secondary_color' => '#ffffff',
            'position' => 'bottom-right',
            'title' => 'تحدث معنا',
            'subtitle' => 'نحن هنا لمساعدتك',
            'welcome_message' => 'مرحباً! كيف يمكننا مساعدتك اليوم؟',
            'offline_message' => 'نعتذر، خارج أوقات العمل. سنرد عليك في أقرب وقت.',
            'is_active' => true,
        ]);

        \App\Models\AutoReply::create([
            'tenant_id' => $tenant->id,
            'name' => 'رسالة ترحيب',
            'trigger_type' => 'welcome',
            'response_message' => 'مرحباً بك! شكراً لتواصلك معنا. كيف يمكننا مساعدتك؟',
            'is_active' => true,
        ]);
    }
}
