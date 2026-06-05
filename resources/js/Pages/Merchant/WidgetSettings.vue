<template>
    <MerchantLayout>
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">إعدادات Widget الشات</h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm">
                <form @submit.prevent="updateWidget" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">اللون الأساسي</label>
                        <input type="color" v-model="form.primary_color" class="w-full h-10 rounded cursor-pointer">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">اللون الثانوي</label>
                        <input type="color" v-model="form.secondary_color" class="w-full h-10 rounded cursor-pointer">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">الموضع</label>
                        <select v-model="form.position" class="w-full px-4 py-2 border rounded-lg">
                            <option value="bottom-right">أسفل اليمين</option>
                            <option value="bottom-left">أسفل اليسار</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">العنوان</label>
                        <input type="text" v-model="form.title" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">النص الفرعي</label>
                        <input type="text" v-model="form.subtitle" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">رسالة الترحيب</label>
                        <textarea v-model="form.welcome_message" rows="2" class="w-full px-4 py-2 border rounded-lg"></textarea>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-2">رسالة خارج الدوام</label>
                        <textarea v-model="form.offline_message" rows="2" class="w-full px-4 py-2 border rounded-lg"></textarea>
                    </div>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        <input type="checkbox" v-model="form.is_active" id="active" class="rounded">
                        <label for="active" class="text-sm text-gray-700">تفعيل Widget</label>
                    </div>
                    <button type="submit" class="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
                        حفظ الإعدادات
                    </button>
                </form>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm">
                <h2 class="text-lg font-semibold mb-4">كود التضمين</h2>
                <p class="text-sm text-gray-500 mb-3">انسخ هذا الكود وأضفه في متجر سلة داخل إعدادات HTML</p>
                <textarea readonly rows="8" class="w-full px-4 py-2 border rounded-lg bg-gray-50 text-xs font-mono" @click="$event.target.select()">{{ embedCode }}</textarea>
            </div>
        </div>
    </MerchantLayout>
</template>

<script setup>
import { reactive } from 'vue'
import { router } from '@inertiajs/vue3'
import MerchantLayout from '@/Layouts/MerchantLayout.vue'

const props = defineProps({ settings: Object, embedCode: String })

const form = reactive({
    primary_color: props.settings.primary_color,
    secondary_color: props.settings.secondary_color,
    position: props.settings.position,
    title: props.settings.title,
    subtitle: props.settings.subtitle,
    welcome_message: props.settings.welcome_message,
    offline_message: props.settings.offline_message || '',
    is_active: props.settings.is_active,
})

function updateWidget() {
    router.post('/merchant/widget', form)
}
</script>
