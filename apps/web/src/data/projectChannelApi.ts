import {
  conversationMessagesResponseSchema,
  conversationSchema,
  type ConversationMessageCreateInput,
} from "@cofound/shared";
import { apiClient } from "@/lib/api-client";

export function openProjectChannel(projectId: string) {
  return apiClient.post(`/conversations/project/${projectId}`, {}, conversationSchema);
}

export function getProjectChannelMessages(conversationId: string) {
  return apiClient.get(`/conversations/${conversationId}/messages`, conversationMessagesResponseSchema);
}

export function sendProjectChannelMessage(conversationId: string, input: ConversationMessageCreateInput) {
  return apiClient.post(`/conversations/${conversationId}/messages`, input, undefined);
}
