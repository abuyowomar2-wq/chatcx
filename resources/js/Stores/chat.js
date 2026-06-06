import { defineStore } from 'pinia'
import axios from 'axios'

export const useChatStore = defineStore('chat', {
    state: () => ({
        conversations: [],
        currentConversation: null,
        messages: [],
        agentStatus: 'offline',
        isConnected: false,
    }),

    actions: {
        setConversations(conversations) {
            this.conversations = conversations
        },

        setCurrentConversation(conversation) {
            this.currentConversation = conversation
        },

        addMessage(message) {
            this.messages.push(message)
        },

        setMessages(messages) {
            this.messages = messages
        },

        setAgentStatus(status) {
            this.agentStatus = status
        },

        updateConversation(id, data) {
            const idx = this.conversations.findIndex(c => c.id === id)
            if (idx !== -1) {
                this.conversations[idx] = { ...this.conversations[idx], ...data }
            }
        },
    },
})
