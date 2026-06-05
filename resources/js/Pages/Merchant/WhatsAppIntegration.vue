<template>
    <MerchantLayout>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">ربط واتساب</h1>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm max-w-lg">
            <div v-if="isConnected" class="text-center">
                <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">واتساب متصل</h2>
                <p class="text-sm text-gray-500 mb-2">رقم الهاتف: {{ phoneNumber }}</p>
                <p class="text-xs text-gray-400 mb-4">
                    رابط Webhook: <code class="bg-gray-100 px-2 py-0.5 rounded">{{ webhookUrl }}</code>
                    <br>
                    Verify Token: <code class="bg-gray-100 px-2 py-0.5 rounded">{{ verifyToken }}</code>
                </p>
                <button @click="disconnect" class="text-red-500 hover:text-red-700 text-sm">فصل واتساب</button>
            </div>

            <div v-else>
                <div class="text-center mb-6">
                    <div class="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    </div>
                    <h2 class="text-lg font-semibold text-gray-800 mb-2">ربط واتساب</h2>
                    <p class="text-sm text-gray-500">أدخل بيانات WhatsApp Business API الخاصة بك</p>
                </div>

                <form @submit.prevent="connectWhatsApp" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">Phone Number ID</label>
                        <input type="text" v-model="form.phone_number_id" required
                            class="w-full px-4 py-2 border rounded-lg" placeholder="من حساب Meta Developer">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">Access Token</label>
                        <input type="text" v-model="form.access_token" required
                            class="w-full px-4 py-2 border rounded-lg" placeholder="Permanent Access Token">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">رقم الهاتف (اختياري)</label>
                        <input type="text" v-model="form.phone_number"
                            class="w-full px-4 py-2 border rounded-lg" placeholder="966xxxxxxxxx">
                    </div>
                    <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                        ربط واتساب
                    </button>
                </form>

                <div class="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <p class="font-semibold mb-2">كيفية الحصول على البيانات:</p>
                    <ol class="list-decimal list-inside space-y-1">
                        <li>ادخل إلى <a href="https://developers.facebook.com" target="_blank" class="underline">Meta for Developers</a></li>
                        <li>أنشئ تطبيق وأضف منتج WhatsApp</li>
                        <li>اربط رقم هاتفك التجاري</li>
                        <li>انسخ Phone Number ID و Access Token</li>
                    </ol>
                </div>
            </div>
        </div>
    </MerchantLayout>
</template>

<script setup>
import { reactive } from 'vue'
import { router } from '@inertiajs/vue3'
import MerchantLayout from '@/Layouts/MerchantLayout.vue'

const props = defineProps({ isConnected: Boolean, phoneNumber: String, webhookUrl: String, verifyToken: String })

const form = reactive({ phone_number_id: '', access_token: '', phone_number: '' })

function connectWhatsApp() {
    router.post('/merchant/whatsapp/connect', form)
}

function disconnect() {
    if (confirm('هل أنت متأكد من فصل واتساب؟')) {
        router.post('/merchant/whatsapp/disconnect')
    }
}
</script>
