<template>
    <MerchantLayout>
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">الوكلاء</h1>
            <button @click="showForm = true" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
                إضافة وكيل
            </button>
        </div>

        <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.away="showForm = false">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 class="text-lg font-semibold mb-4">إضافة وكيل جديد</h2>
                <form @submit.prevent="addAgent" class="space-y-3">
                    <input type="text" v-model="agentForm.name" placeholder="الاسم" required
                        class="w-full px-4 py-2 border rounded-lg">
                    <input type="email" v-model="agentForm.email" placeholder="البريد الإلكتروني" required
                        class="w-full px-4 py-2 border rounded-lg">
                    <input type="password" v-model="agentForm.password" placeholder="كلمة المرور" required minlength="8"
                        class="w-full px-4 py-2 border rounded-lg">
                    <input type="password" v-model="agentForm.password_confirmation" placeholder="تأكيد كلمة المرور" required
                        class="w-full px-4 py-2 border rounded-lg">
                    <div class="flex space-x-2 space-x-reverse">
                        <button type="submit" class="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">إضافة</button>
                        <button type="button" @click="showForm = false" class="px-4 py-2 border rounded-lg text-gray-600">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm">
            <table class="w-full">
                <thead>
                    <tr class="border-b">
                        <th class="text-right p-4 text-sm text-gray-500">الاسم</th>
                        <th class="text-right p-4 text-sm text-gray-500">البريد</th>
                        <th class="text-right p-4 text-sm text-gray-500">الحالة</th>
                        <th class="text-right p-4 text-sm text-gray-500">المحادثات</th>
                        <th class="text-left p-4 text-sm text-gray-500"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="agent in agents" :key="agent.id" class="border-b last:border-0 hover:bg-gray-50">
                        <td class="p-4 font-medium">{{ agent.name }}</td>
                        <td class="p-4 text-gray-600 text-sm">{{ agent.email }}</td>
                        <td class="p-4">
                            <span :class="statusClass(agent.status)" class="px-2 py-1 rounded-full text-xs">
                                {{ statusText(agent.status) }}
                            </span>
                        </td>
                        <td class="p-4 text-sm">{{ agent.active_conversations }}/{{ agent.max_conversations }}</td>
                        <td class="p-4 text-left">
                            <button @click="deleteAgent(agent.id)" class="text-red-500 hover:text-red-700 text-sm">حذف</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="agents.length === 0" class="p-8 text-center text-gray-400">
                لا يوجد وكلاء بعد. أضف وكيلاً جديداً
            </div>
        </div>
    </MerchantLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { router } from '@inertiajs/vue3'
import MerchantLayout from '@/Layouts/MerchantLayout.vue'

const props = defineProps({ agents: Array })

const showForm = ref(false)
const agentForm = reactive({
    name: '', email: '', password: '', password_confirmation: '',
})

function statusClass(status) {
    const map = { online: 'bg-green-100 text-green-700', away: 'bg-yellow-100 text-yellow-700', busy: 'bg-red-100 text-red-700', offline: 'bg-gray-100 text-gray-700' }
    return map[status] || 'bg-gray-100 text-gray-700'
}

function statusText(status) {
    const map = { online: 'متصل', away: 'بعيد', busy: 'مشغول', offline: 'غير متصل' }
    return map[status] || 'غير متصل'
}

function addAgent() {
    router.post('/merchant/agents', agentForm, {
        onSuccess: () => { showForm.value = false; agentForm.name = ''; agentForm.email = ''; agentForm.password = ''; agentForm.password_confirmation = '' }
    })
}

function deleteAgent(id) {
    if (confirm('هل أنت متأكد من حذف هذا الوكيل؟')) {
        router.delete(`/merchant/agents/${id}`)
    }
}
</script>
