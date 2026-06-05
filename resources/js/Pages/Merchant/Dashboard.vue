<template>
    <MerchantLayout>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <p class="text-gray-500">مرحباً بك {{ $page.props.auth.user.name }}</p>
        </div>

        <div v-if="$page.props.flash?.success" class="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {{ $page.props.flash.success }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-gray-500 text-sm">المحادثات النشطة</h3>
                <p class="text-3xl font-bold text-primary-600 mt-1">{{ stats.active_conversations }}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-gray-500 text-sm">إجمالي المحادثات</h3>
                <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.total_conversations }}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-gray-500 text-sm">الجهات المتصلة</h3>
                <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.total_contacts }}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-gray-500 text-sm">الوكلاء</h3>
                <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.online_agents }} / {{ stats.total_agents }}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-gray-800 mb-3">التكاملات</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>سلة (Salla)</span>
                        <span :class="stats.salla_connected ? 'text-green-600 bg-green-100 px-2 py-0.5 rounded text-sm' : 'text-red-600 bg-red-100 px-2 py-0.5 rounded text-sm'">
                            {{ stats.salla_connected ? 'متصل' : 'غير متصل' }}
                        </span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>واتساب</span>
                        <span :class="stats.whatsapp_connected ? 'text-green-600 bg-green-100 px-2 py-0.5 rounded text-sm' : 'text-red-600 bg-red-100 px-2 py-0.5 rounded text-sm'">
                            {{ stats.whatsapp_connected ? 'متصل' : 'غير متصل' }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="font-semibold text-gray-800 mb-3">روابط سريعة</h3>
                <div class="space-y-2">
                    <Link href="/merchant/widget" class="block p-3 bg-gray-50 rounded hover:bg-primary-50 transition">
                        تخصيص Widget الشات
                    </Link>
                    <Link href="/merchant/agents" class="block p-3 bg-gray-50 rounded hover:bg-primary-50 transition">
                        إدارة الوكلاء
                    </Link>
                    <Link href="/merchant/auto-replies" class="block p-3 bg-gray-50 rounded hover:bg-primary-50 transition">
                        الردود التلقائية
                    </Link>
                </div>
            </div>
        </div>
    </MerchantLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3'
import MerchantLayout from '@/Layouts/MerchantLayout.vue'

defineProps({
    stats: Object,
    storeName: String,
})
</script>
