import { z } from 'zod'
import { AccountStatus, ProjectStatus } from './enums.js'
import { ApiErrorCode } from './errors.js'

export const idSchema = z.string().min(1)

export const localeSchema = z.enum(['fr', 'mg'])

export const paginationQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const amountSchema = z.object({
  amount: z.number().finite().nonnegative(),
  currency: z.string().length(3).toUpperCase(),
})

export const loginInputSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(12).max(128),
})

export const activationInputSchema = z.object({
  token: z.string().min(32).max(512),
  password: z.string().min(12).max(128),
  locale: localeSchema.default('fr'),
  acceptTerms: z.literal(true),
})

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email(),
})

export const passwordResetInputSchema = z.object({
  token: z.string().min(32).max(512),
  password: z.string().min(12).max(128),
})

export const talentProfileInputSchema = z.object({
  pseudonym: z.string().trim().min(2).max(80),
  headline: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(2_000).optional(),
  fieldId: idSchema.optional(),
  cohortYear: z.number().int().min(1950).max(2_100).optional(),
  availabilityHours: z.number().int().min(0).max(168).optional(),
  goals: z.array(z.string().min(1).max(80)).max(10).default([]),
  sectorIds: z.array(idSchema).max(10).default([]),
  visibleInTalentFeed: z.boolean().default(false),
})

export const publicTalentViewSchema = z.object({
  revealed: z.literal(false),
  pseudonym: z.string(),
  avatarSeed: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  fieldId: idSchema.nullable(),
  cohortYear: z.number().int().nullable(),
  availabilityHours: z.number().int().nullable(),
  completion: z.number().int().min(0).max(100),
})

export const revealedTalentViewSchema = publicTalentViewSchema.extend({
  revealed: z.literal(true),
  firstName: z.string(),
  lastName: z.string(),
  photoKey: z.string().nullable(),
  phone: z.string().nullable(),
})

export const talentViewSchema = z.discriminatedUnion('revealed', [
  publicTalentViewSchema,
  revealedTalentViewSchema,
])

export const projectSummarySchema = z.object({
  id: idSchema,
  title: z.string(),
  pitch: z.string(),
  status: z.nativeEnum(ProjectStatus),
  createdAt: z.coerce.date(),
})

export const accountStatusSchema = z.nativeEnum(AccountStatus)

export const apiErrorSchema = z.object({
  code: z.nativeEnum(ApiErrorCode),
  messageKey: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
})

export const importFieldSchema = z.enum([
  'email',
  'firstName',
  'lastName',
  'fieldOfStudy',
  'level',
  'entryYear',
  'gender',
  'studentNumber',
])

export const emailBounceWebhookSchema = z.object({
  event: z.literal('email.bounced'),
  email: z.string().trim().email(),
  batchId: idSchema.optional(),
  providerMessageId: z.string().min(1).optional(),
})

export type EmailBounceWebhook = z.infer<typeof emailBounceWebhookSchema>

export const importColumnMappingSchema = z.object({
  columns: z.record(z.string().trim().min(1), importFieldSchema.nullable()),
})

export const importPreviewResultSchema = z.enum(['CREATED', 'UPDATED', 'SKIPPED_DUPLICATE', 'ERROR'])

export const importPreviewRowSchema = z.object({
  lineNumber: z.number().int().positive(),
  displayName: z.string().min(1),
  email: z.string().min(1),
  result: importPreviewResultSchema,
  errorMessage: z.string().min(1).nullable(),
})

export const importPreviewSchema = z.object({
  batchId: idSchema,
  fileName: z.string().min(1),
  rows: z.array(importPreviewRowSchema),
})

export type ImportField = z.infer<typeof importFieldSchema>
export type ImportColumnMapping = z.infer<typeof importColumnMappingSchema>
export type ImportPreviewResult = z.infer<typeof importPreviewResultSchema>
export type ImportPreviewRow = z.infer<typeof importPreviewRowSchema>
export type ImportPreview = z.infer<typeof importPreviewSchema>

export type LoginInput = z.infer<typeof loginInputSchema>
export type ActivationInput = z.infer<typeof activationInputSchema>
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetInputSchema>
export type TalentProfileInput = z.infer<typeof talentProfileInputSchema>
export type TalentView = z.infer<typeof talentViewSchema>
export type ProjectSummary = z.infer<typeof projectSummarySchema>
export type ApiError = z.infer<typeof apiErrorSchema>
