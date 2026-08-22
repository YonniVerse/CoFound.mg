import { blockResultSchema, blockedUsersResponseSchema } from '@cofound/shared'
import { apiClient } from '@/lib/api-client'

export function blockUser(userId: string) {
  return apiClient.post(`/blocks/${userId}`, {}, blockResultSchema)
}

export function unblockUser(userId: string) {
  return apiClient.request(`/blocks/${userId}`, { method: 'DELETE' }, blockResultSchema)
}

export function listBlockedUsers() {
  return apiClient.get('/blocks', blockedUsersResponseSchema)
}
