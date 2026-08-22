import { apiClient } from '@/lib/api-client'
import { reportCreateSchema, reportResponseSchema, type ReportCreateInput, type ReportResponse } from '@cofound/shared'

export function createReport(input: ReportCreateInput): Promise<ReportResponse> {
  return apiClient.post('/reports', reportCreateSchema.parse(input), reportResponseSchema)
}
