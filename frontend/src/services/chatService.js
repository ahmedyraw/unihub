import api from './api';

const chatService = {
    createConversation: async (participantIds, isGroup = false, groupName = null) => {
        const response = await api.post('/chat/conversations', {
            participantIds,
            isGroup,
            groupName
        });
        return response.data;
    },

    getConversations: async () => {
        const response = await api.get('/chat/conversations');
        return response.data;
    },

    getMessages: async (conversationId, page = 0, size = 50) => {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
            params: { page, size }
        });
        return response.data;
    },

    markAsRead: async (conversationId) => {
        await api.post(`/chat/conversations/${conversationId}/read`);
    },

    editMessage: async (messageId, content) => {
        const response = await api.put(`/chat/messages/${messageId}`, content, {
            headers: { 'Content-Type': 'text/plain' }
        });
        return response.data;
    },

    deleteMessage: async (messageId) => {
        await api.delete(`/chat/messages/${messageId}`);
    },

    addReaction: async (messageId, emoji) => {
        await api.post(`/chat/messages/${messageId}/reactions`, null, {
            params: { emoji }
        });
    },

    searchMessages: async (conversationId, query) => {
        const response = await api.get(`/chat/conversations/${conversationId}/search`, {
            params: { query }
        });
        return response.data;
    },

    deleteConversation: async (conversationId) => {
        await api.delete(`/chat/conversations/${conversationId}`);
    }
};

export default chatService;
