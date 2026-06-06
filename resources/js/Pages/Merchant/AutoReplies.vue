<template>
    <MerchantLayout>
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">الردود التلقائية</h1>
            <button @click="showForm = true" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
                إضافة رد
            </button>
        </div>

        <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" @click.away="showForm = false">
            <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 class="text-lg font-semibold mb-4">إضافة رد تلقائي</h2>
                <form @submit.prevent="addReply" class="space-y-3">
                    <input type="text" v-model="replyForm.name" placeholder="اسم الرد" required
                        class="w-full px-4 py-2 border rounded-lg">
                    <select v-model="replyForm.trigger_type" class="w-full px-4 py-2 border rounded-lg">
                        <option value="welcome">رسالة ترحيب</option>
                        <option value="keyword">كلمة مفتاحية</option>
                        <option value="off_hours">خارج أوقات الدوام</option>
                    </select>
                    <div v-if="replyForm.trigger_type === 'keyword'">
                        <label class="block text-sm text-gray-600 mb-1">الكلمات المفتاحية (كلمة في كل سطر)</label>
                        <textarea v-model="keywordsText" rows="3" class="w-full px-4 py-2 border rounded-lg"
                            placeholder="سعر&#10;كم سعر&#10;السعر"></textarea>
                    </div>
                    <div v-if="replyForm.trigger_type === 'off_hours'">
                        <div class="flex space-x-2 space-x-reverse">
                            <div class="flex-1">
                                <label class="block text-sm text-gray-600 mb-1">من</label>
                                <input type="time" v-model="replyForm.start_time" class="w-full px-4 py-2 border rounded-lg">
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm text-gray-600 mb-1">إلى</label>
                                <input type="time" v-model="replyForm.end_time" class="w-full px-4 py-2 border rounded-lg">
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">نص الرد</label>
                        <textarea v-model="replyForm.response_message" rows="3" required
                            class="w-full px-4 py-2 border rounded-lg" placeholder="نص الرد التلقائي..."></textarea>
                    </div>
                    <div class="flex space-x-2 space-x-reverse">
                        <button type="submit" class="flex-1 bg-primary-600 text-white py-2 rounded-lg">إضافة</button>
                        <button type="button" @click="showForm = false" class="px-4 py-2 border rounded-lg text-gray-600">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="space-y-3">
            <div v-for="reply in autoReplies" :key="reply.id" class="bg-white p-4 rounded-lg shadow-sm">
                <div class="flex items-start justify-between">
                    <div>
                        <h3 class="font-semibold">{{ reply.name }}</h3>
                        <span class="text-xs px-2 py-0.5 rounded mt-1 inline-block"
                            :class="triggerClass(reply.trigger_type)">
                            {{ triggerText(reply.trigger_type) }}
                        </span>
                        <p class="text-sm text-gray-600 mt-2">{{ reply.response_message }}</p>
                    </div>
                    <button @click="deleteReply(reply.id)" class="text-red-500 hover:text-red-700 text-sm">حذف</button>
                </div>
            </div>

            <div v-if="autoReplies.length === 0" class="text-center text-gray-400 py-8">
                لا توجد ردود تلقائية. أضف رداً جديداً
            </div>
        </div>
    </MerchantLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { router } from '@inertiajs/vue3'
import MerchantLayout from '@/Layouts/MerchantLayout.vue'

const props = defineProps({ autoReplies: Array })

const showForm = ref(false)
const keywordsText = ref('')
const replyForm = reactive({
    name: '', trigger_type: 'welcome', keywords: [], response_message: '',
    start_time: '09:00', end_time: '17:00',
})

function triggerClass(type) {
    const map = { welcome: 'bg-blue-100 text-blue-700', keyword: 'bg-purple-100 text-purple-700', off_hours: 'bg-yellow-100 text-yellow-700' }
    return map[type] || 'bg-gray-100 text-gray-700'
}

function triggerText(type) {
    const map = { welcome: 'ترحيب', keyword: 'كلمة مفتاحية', off_hours: 'خارج الدوام' }
    return map[type] || type
}

function addReply() {
    const formData = { ...replyForm }
    if (formData.trigger_type === 'keyword') {
        formData.keywords = keywordsText.value.split('\n').filter(k => k.trim())
    }
    router.post('/merchant/auto-replies', formData, {
        onSuccess: () => { showForm.value = false; replyForm.name = ''; replyForm.response_message = ''; keywordsText.value = '' }
    })
}

function deleteReply(id) {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        router.delete(`/merchant/auto-replies/${id}`)
    }
}
</script>
