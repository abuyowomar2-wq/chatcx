<template>
    <AgentLayout>
        <div class="flex h-[calc(100vh-8rem)]">
            <div class="w-96 bg-white rounded-r-lg shadow-sm border-l overflow-y-auto">
                <div class="p-4 border-b">
                    <h2 class="text-lg font-semibold text-gray-800">المحادثات</h2>
                    <div class="mt-2 relative">
                        <input type="text" v-model="search" placeholder="بحث..."
                            class="w-full px-3 py-2 border rounded-lg text-sm">
                    </div>
                    <div class="flex items-center mt-3 space-x-2 space-x-reverse text-sm">
                        <span class="text-gray-500">نشط:</span>
                        <span class="font-semibold text-green-600">{{ activeCount }}</span>
                        <span class="text-gray-300 mx-1">|</span>
                        <span class="text-gray-500">الحد الأقصى:</span>
                        <span class="font-semibold">{{ maxConversations }}</span>
                    </div>
                </div>

                <div class="divide-y">
                    <div v-for="conv in filteredConversations" :key="conv.id"
                        @click="openConversation(conv.id)"
                        class="p-4 hover:bg-gray-50 cursor-pointer transition"
                        :class="{ 'bg-primary-50': selectedId === conv.id }">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center space-x-2 space-x-reverse">
                                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                                    {{ conv.contact_name?.charAt(0) || 'ع' }}
                                </div>
                                <div>
                                    <h3 class="font-medium text-gray-900">{{ conv.contact_name }}</h3>
                                    <p class="text-xs text-gray-500">{{ conv.channel === 'whatsapp' ? 'واتساب' : conv.channel === 'salla' ? 'سلة' : 'Widget' }}</p>
                                </div>
                            </div>
                            <div class="text-left">
                                <span class="text-xs text-gray-400">{{ conv.last_message_at }}</span>
                                <div v-if="conv.unread > 0" class="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1 mr-auto">
                                    {{ conv.unread }}
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 mt-2 truncate">{{ conv.last_message || 'لا توجد رسائل' }}</p>
                    </div>

                    <div v-if="filteredConversations.length === 0" class="p-8 text-center text-gray-400">
                        لا توجد محادثات نشطة
                    </div>
                </div>
            </div>

            <div class="flex-1 bg-white shadow-sm rounded-l-lg flex flex-col">
                <div v-if="selectedId" class="flex-1 flex flex-col">
                    <div class="p-4 border-b bg-gray-50">
                        <h2 class="text-lg font-semibold">المحادثة</h2>
                    </div>
                    <div class="flex-1 p-4 overflow-y-auto" ref="messagesContainer">
                        <p class="text-center text-gray-400">اختر محادثة من القائمة</p>
                    </div>
                </div>
                <div v-else class="flex-1 flex items-center justify-center">
                    <div class="text-center">
                        <div class="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        </div>
                        <p class="mt-4 text-gray-500">اختر محادثة للبدء</p>
                    </div>
                </div>
            </div>
        </div>
    </AgentLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import AgentLayout from '@/Layouts/AgentLayout.vue'

const props = defineProps({
    conversations: Array,
    agentStatus: String,
    activeCount: Number,
    maxConversations: Number,
})

const search = ref('')
const selectedId = ref(null)

const filteredConversations = computed(() => {
    if (!search.value) return props.conversations
    const q = search.value.toLowerCase()
    return props.conversations.filter(c =>
        c.contact_name?.toLowerCase().includes(q) ||
        c.last_message?.toLowerCase().includes(q)
    )
})

function openConversation(id) {
    selectedId.value = id
    router.get(`/agent/conversations/${id}`, {}, {
        preserveState: true,
        preserveScroll: true,
    })
}
</script>
