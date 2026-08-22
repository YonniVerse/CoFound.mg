import { apiClient } from '@/lib/api-client'
import {
  dreamMatchNotInterestedResponseSchema,
  dreamMatchProfileResponseSchema,
  dreamMatchSuggestionsResponseSchema,
  dreamMatchUpsertResponseSchema,
  type DreamMatchNotInterestedResponse,
  type DreamMatchSuggestionsResponse,
  type DreamMatchUpsertRequest,
} from '@cofound/shared'

export function getDreamMatchProfile() {
  return apiClient.get('/me/dream-match', dreamMatchProfileResponseSchema)
}

export function saveDreamMatchProfile(input: DreamMatchUpsertRequest) {
  return apiClient.patch('/me/dream-match', input, dreamMatchUpsertResponseSchema)
}

export function getDreamMatchSuggestions(params?: { cursor?: string; limit?: number }): Promise<DreamMatchSuggestionsResponse> {
  const query = new URLSearchParams()
  if (params?.cursor) query.set('cursor', params.cursor)
  if (params?.limit) query.set('limit', String(params.limit))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiClient.get(`/me/dream-match/suggestions${suffix}`, dreamMatchSuggestionsResponseSchema)
}

export function markDreamMatchNotInterested(talentId: string): Promise<DreamMatchNotInterestedResponse> {
  return apiClient.post(`/me/dream-match/suggestions/${encodeURIComponent(talentId)}/not-interested`, {}, dreamMatchNotInterestedResponseSchema)
}
