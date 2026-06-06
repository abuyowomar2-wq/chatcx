<template>
    <MerchantLayout>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">إعدادات المتجر</h1>
        </div>

        <div class="max-w-lg">
            <form @submit.prevent="updateSettings" class="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-2">اسم المتجر</label>
                    <input type="text" v-model="form.store_name" required
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-2">البريد الإلكتروني</label>
                    <input type="email" :value="tenant.email" disabled
                        class="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-2">رقم الجوال</label>
                    <input type="tel" v-model="form.phone"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-2">الخطة</label>
                    <input type="text" :value="tenant.plan" disabled
                        class="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500">
                </div>

                <button type="submit"
                    class="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
                    حفظ التغييرات
                </button>
            </form>
        </div>
    </MerchantLayout>
</template>

<script setup>
import { reactive } from 'vue'
import { router } from '@inertiajs/vue3'
import MerchantLayout from '@/Layouts/MerchantLayout.vue'

const props = defineProps({ tenant: Object })

const form = reactive({
    store_name: props.tenant.store_name,
    phone: props.tenant.phone,
})

function updateSettings() {
    router.post('/merchant/settings', form)
}
</script>
