<template>
    <MerchantLayout>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">ربط متجر سلة</h1>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm max-w-lg">
            <div v-if="isConnected" class="text-center">
                <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">المتجر متصل</h2>
                <p class="text-sm text-gray-500 mb-4">{{ storeData?.name || '' }}</p>
                <button @click="disconnect" class="text-red-500 hover:text-red-700 text-sm">فصل المتجر</button>
            </div>

            <div v-else class="text-center">
                <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800 mb-2">ربط متجر سلة</h2>
                <p class="text-sm text-gray-500 mb-4">اربط متجر سلة لاستقبال طلبات العملاء وعرضها في الشات</p>
                <a :href="authUrl" class="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                    ربط المتجر
                </a>
            </div>
        </div>
    </MerchantLayout>
</template>

<script setup>
import MerchantLayout from '@/Layouts/MerchantLayout.vue'
import { router } from '@inertiajs/vue3'

const props = defineProps({ isConnected: Boolean, storeData: Object, authUrl: String })

function disconnect() {
    if (confirm('هل أنت متأكد من فصل متجر سلة؟')) {
        router.post('/merchant/salla/disconnect')
    }
}
</script>
