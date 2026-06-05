<template>
    <AgentLayout>
        <div class="flex h-[calc(100vh-8rem)]">
            <div class="w-96 bg-white rounded-r-lg shadow-sm border-l overflow-y-auto">
                <div class="p-4 border-b">
                    <Link href="/agent/inbox" class="text-primary-600 hover:text-primary-700 text-sm">← العودة للقائمة</Link>
                    <h2 class="text-lg font-semibold text-gray-800 mt-2">المحادثة</h2>
                </div>

                <div class="p-4 border-b">
                    <div class="flex items-center space-x-2 space-x-reverse">
                        <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                            {{ conversation.contact?.name?.charAt(0) || 'ع' }}
                        </div>
                        <div>
                            <h3 class="font-semibold">{{ conversation.contact?.name || 'عميل' }}</h3>
                            <p class="text-xs text-gray-500">{{ conversation.contact?.phone || conversation.contact?.email }}</p>
                            <span class="text-xs px-2 py-0.5 rounded mt-1 inline-block"
                                :class="channelClass">
                                {{ channelText }}
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="conversation.salla_orders?.length" class="p-4 border-b">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">طلبات سلة</h4>
                    <div v-for="order in conversation.salla_orders" :key="order.id" class="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-1">
                        طلب #{{ order.reference_id || order.id }} - {{ order.status?.name || 'جديد' }}
                    </div>
                </div>
            </div>

            <div class="flex-1 bg-white shadow-sm rounded-l-lg flex flex-col">
                <div class="flex-1 p-4 overflow-y-auto space-y-3" ref="messagesContainer">
                    <div v-for="msg in messages" :key="msg.id"
                        class="flex" :class="msg.direction === 'outgoing' ? 'justify-start' : 'justify-end'">
                        <div class="max-w-md px-4 py-2 rounded-lg text-sm"
                            :class="msg.direction === 'outgoing' ? 'bg-primary-600 text-white rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-br-none'">
                            <p>{{ msg.body }}</p>
                            <p class="text-xs mt-1" :class="msg.direction === 'outgoing' ? 'text-primary-200' : 'text-gray-400'">
                                {{ formatTime(msg.created_at) }}
                            </p>
                        </div>
                    </div>

                    <div v-if="messages.length === 0" class="text-center text-gray-400 py-8">
                        لا توجد رسائل بعد
                    </div>
                </div>

                <div class="p-4 border-t">
                    <div v-if="aiSuggestion" class="mb-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center justify-between">
                        <span>{{ aiSuggestion }}</span>
                        <button @click="useSuggestion" class="text-blue-500 hover:text-blue-700 text-xs mr-2">استخدام</button>
                    </div>
                    <form @submit.prevent="sendMessage" class="flex space-x-2 space-x-reverse">
                        <input type="text" v-model="newMessage" placeholder="اكتب رسالتك..."
                            @keydown="onTyping"
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                            :disabled="sending">
                        <button type="submit" :disabled="!newMessage.trim() || sending"
                            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm">
                            إرسال
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </AgentLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import axios from 'axios'
import AgentLayout from '@/Layouts/AgentLayout.vue'

const props = defineProps({
    conversation: Object,
    messages: Array,
})

const newMessage = ref('')
const sending = ref(false)
const aiSuggestion = ref(null)
const typingTimer = ref(null)

const channelText = computed(() => {
    const map = { whatsapp: 'واتساب', salla: 'سلة', widget: 'Widget' }
    return map[props.conversation?.channel] || 'Widget'
})

const channelClass = computed(() => ({
    'bg-green-100 text-green-700': props.conversation?.channel === 'whatsapp',
    'bg-purple-100 text-purple-700': props.conversation?.channel === 'salla',
    'bg-blue-100 text-blue-700': props.conversation?.channel === 'widget',
}))

function formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
}

function sendMessage() {
    if (!newMessage.value.trim() || sending.value) return

    sending.value = true
    axios.post('/agent/conversations/message', {
        conversation_id: props.conversation.id,
        message: newMessage.value,
    }).then(() => {
        newMessage.value = ''
        aiSuggestion.value = null
        router.reload({ preserveScroll: true, preserveState: true })
    }).finally(() => {
        sending.value = false
    })
}

function onTyping() {
    if (typingTimer.value) clearTimeout(typingTimer.value)
    typingTimer.value = setTimeout(() => {
        axios.post('/agent/conversations/typing', {
            conversation_id: props.conversation.id,
        })
    }, 1000)
}

function useSuggestion() {
    newMessage.value = aiSuggestion.value
    aiSuggestion.value = null
}

watch(newMessage, (val) => {
    if (val.length > 10 && !aiSuggestion.value) {
        const timer = setTimeout(() => {
            axios.post('/agent/conversations/ai-suggest', { message: val })
                .then(res => { aiSuggestion.value = res.data.suggestion })
                .catch(() => {})
        }, 1500)
        return () => clearTimeout(timer)
    }
})
</script>
