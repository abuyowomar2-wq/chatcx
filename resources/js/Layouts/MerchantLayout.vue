<template>
    <div class="min-h-screen bg-gray-50 rtl">
        <nav class="bg-white border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <Link href="/merchant/dashboard" class="text-xl font-bold text-primary-600">ChatCX</Link>
                        <span class="mr-4 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">تاجر</span>
                    </div>
                    <div class="hidden md:flex items-center space-x-4 space-x-reverse">
                        <Link href="/merchant/dashboard" class="px-3 py-2 text-sm text-gray-700 hover:text-primary-600">الرئيسية</Link>
                        <Link href="/merchant/agents" class="px-3 py-2 text-sm text-gray-700 hover:text-primary-600">الوكلاء</Link>
                        <Link href="/merchant/widget" class="px-3 py-2 text-sm text-gray-700 hover:text-primary-600">Widget</Link>
                        <Link href="/merchant/salla" class="px-3 py-2 text-sm text-gray-700 hover:text-primary-600">سلة</Link>
                        <Link href="/merchant/whatsapp" class="px-3 py-2 text-sm text-gray-700 hover:text-primary-600">واتساب</Link>
                        <Link href="/merchant/auto-replies" class="px-3 py-2 text-sm text-gray-700 hover:text-primary-600">ردود تلقائية</Link>
                        <Link href="/merchant/settings" class="px-3 py-2 text-sm text-gray-700 hover:text-primary-600">الإعدادات</Link>
                    </div>
                    <div class="flex items-center">
                        <form @submit.prevent="logout">
                            <button type="submit" class="text-sm text-red-600 hover:text-red-800">تسجيل خروج</button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <slot />
        </main>
    </div>
</template>

<script setup>
import { Link, router } from '@inertiajs/vue3'

function logout() {
    router.post('/logout')
}
</script>
