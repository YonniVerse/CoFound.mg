import { conversationListSchema, conversationMessagesResponseSchema } from '@cofound/shared'
import { apiClient } from '@/lib/api-client'

export function listConversations() {
  return apiClient.get('/conversations', conversationListSchema)
}

export function getMessages(conversationId: string) {
  return apiClient.get(`/conversations/${conversationId}/messages`, conversationMessagesResponseSchema)
}

export function sendMessage(conversationId: string, body: string) {
  return apiClient.post(`/conversations/${conversationId}/messages`, { body }, undefined)
}
