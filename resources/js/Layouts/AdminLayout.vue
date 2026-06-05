<template>
    <div class="min-h-screen bg-gray-50 rtl">
        <nav class="bg-white border-b">
            <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <h1 class="text-xl font-bold text-primary-600">ChatCX</h1>
                <form @submit.prevent="logout"><button class="text-red-600 text-sm">تسجيل خروج</button></form>
            </div>
        </nav>
        <main class="max-w-7xl mx-auto px-4 py-6">
            <slot />
        </main>
    </div>
</template>

<script setup>
import { router } from '@inertiajs/vue3'
function logout() { router.post('/logout') }
</script>
