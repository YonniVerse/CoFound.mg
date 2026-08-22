import { notificationsResponseSchema } from '@cofound/shared'
import { apiClient } from '@/lib/api-client'

export function listNotifications() {
  return apiClient.get('/notifications', notificationsResponseSchema)
}

export function markNotificationRead(id: string) {
  return apiClient.request(`/notifications/${id}/read`, { method: 'PATCH' })
}
