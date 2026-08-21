import { apiClient } from '@/lib/api-client'
import {
  dreamMatchProfileResponseSchema,
  dreamMatchUpsertResponseSchema,
  type DreamMatchUpsertRequest,
} from '@cofound/shared'

export function getDreamMatchProfile() {
  return apiClient.get('/me/dream-match', dreamMatchProfileResponseSchema)
}

export function saveDreamMatchProfile(input: DreamMatchUpsertRequest) {
  return apiClient.patch('/me/dream-match', input, dreamMatchUpsertResponseSchema)
}
