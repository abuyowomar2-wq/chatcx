<template>
    <div class="min-h-screen bg-gray-50 rtl">
        <nav class="bg-white border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <Link href="/agent/inbox" class="text-xl font-bold text-primary-600">ChatCX</Link>
                        <span class="mr-4 text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">وكيل</span>
                    </div>
                    <div class="flex items-center space-x-4 space-x-reverse">
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <button @click="toggleStatus" class="flex items-center space-x-1 space-x-reverse px-3 py-1 rounded-full text-sm"
                                :class="statusClass">
                                <span class="w-2 h-2 rounded-full" :class="statusDotClass"></span>
                                <span>{{ statusText }}</span>
                            </button>
                        </div>
                        <div class="relative">
                            <button @click="showMenu = !showMenu" class="flex items-center text-gray-700 hover:text-gray-900">
                                <span>{{ $page.props.auth.user.name }}</span>
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </button>
                            <div v-if="showMenu" @click.away="showMenu = false" class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <Link href="/agent/inbox" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">الرئيسية</Link>
                                <form @submit.prevent="logout">
                                    <button type="submit" class="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100">تسجيل خروج</button>
                                </form>
                            </div>
                        </div>
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
import { ref, computed } from 'vue'
import { Link, usePage, router } from '@inertiajs/vue3'

const showMenu = ref(false)
const currentStatus = ref(usePage().props.agentStatus || 'offline')

const statusClass = computed(() => ({
    'bg-green-100 text-green-800': currentStatus.value === 'online',
    'bg-yellow-100 text-yellow-800': currentStatus.value === 'away',
    'bg-red-100 text-red-800': currentStatus.value === 'busy',
    'bg-gray-100 text-gray-800': currentStatus.value === 'offline',
}))

const statusDotClass = computed(() => ({
    'bg-green-500': currentStatus.value === 'online',
    'bg-yellow-500': currentStatus.value === 'away',
    'bg-red-500': currentStatus.value === 'busy',
    'bg-gray-500': currentStatus.value === 'offline',
}))

const statusText = computed(() => {
    const map = { online: 'متصل', away: 'بعيد', busy: 'مشغول', offline: 'غير متصل' }
    return map[currentStatus.value] || 'غير متصل'
})

const statuses = ['online', 'away', 'busy', 'offline']

function toggleStatus() {
    const idx = statuses.indexOf(currentStatus.value)
    const next = statuses[(idx + 1) % statuses.length]
    currentStatus.value = next
    router.post('/agent/status', { status: next })
}

function logout() {
    router.post('/logout')
}
</script>
