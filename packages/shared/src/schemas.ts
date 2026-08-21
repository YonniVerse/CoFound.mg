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
export const talentProfilePatchSchema = talentProfileInputSchema.partial()
export const talentIdentityInputSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  photoKey: z.string().trim().max(255).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  regionId: idSchema.nullable().optional(),
  gender: z.string().trim().max(80).nullable().optional(),
})
export const talentProfileSchema = z.object({
  id: idSchema,
  userId: idSchema,
  pseudonym: z.string(),
  avatarSeed: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  fieldId: idSchema.nullable(),
  field: z.object({ id: idSchema, slug: z.string(), labelKey: z.string() }).nullable(),
  cohortYear: z.number().int().nullable(),
  level: z.string().nullable(),
  availabilityHours: z.number().int().nullable(),
  goals: z.array(z.string()),
  sectorIds: z.array(idSchema),
  completion: z.number().int().min(0).max(100),
  visibleInTalentFeed: z.boolean(),
})
export const onboardingStepSchema = z.number().int().min(1).max(6)
export const onboardingStepNameSchema = z.enum(['identity', 'journey', 'skills', 'goals', 'availability', 'visibility'])
export const onboardingStepRequestSchema = z.object({ step: onboardingStepSchema, data: z.record(z.string(), z.unknown()) })
export const onboardingProgressSchema = z.object({
  currentStep: onboardingStepSchema,
  completedSteps: z.array(onboardingStepSchema),
  completion: z.number().int().min(0).max(100),
  minimumCompletion: z.number().int().min(0).max(100),
  isComplete: z.boolean(),
  stepName: onboardingStepNameSchema,
})
export const onboardingStepResponseSchema = z.object({ progress: onboardingProgressSchema, profile: z.object({ id: idSchema, completion: z.number().int().min(0).max(100) }).nullable() })
export const consentPurposeSchema = z.enum(['PROFILE_VISIBILITY', 'TALENT_MATCHING', 'PARTNER_CONTACT', 'AGGREGATED_ANALYTICS'])
export const consentGrantSchema = z.object({ policyVersion: z.string().trim().min(1).max(40) })
export const consentRevokeSchema = z.object({ confirm: z.literal(true) })
export const consentRecordSchema = z.object({ id: idSchema, purpose: consentPurposeSchema, policyVersion: z.string(), grantedAt: z.coerce.date(), revokedAt: z.coerce.date().nullable(), active: z.boolean() })
export const consentRegistrySchema = z.object({ consents: z.array(consentRecordSchema) })
export type ConsentPurpose = z.infer<typeof consentPurposeSchema>
export type ConsentGrantInput = z.infer<typeof consentGrantSchema>
export type ConsentRevokeInput = z.infer<typeof consentRevokeSchema>
export type ConsentRecord = z.infer<typeof consentRecordSchema>
export const institutionOverviewSchema = z.object({
  organizations: z.array(z.object({
    id: idSchema,
    name: z.string(),
    role: z.string(),
    canManage: z.boolean(),
    metrics: z.object({ affiliates: z.number().int().nullable(), activated: z.number().int().nullable(), completedProfiles: z.number().int().nullable(), projects: z.number().int().nullable() }),
    recentImports: z.array(z.object({ id: idSchema, fileName: z.string(), status: z.string(), createdAt: z.coerce.date(), totalRows: z.number().int(), errorRows: z.number().int() })),
  })),
})
export type InstitutionOverview = z.infer<typeof institutionOverviewSchema>
export const organizationRoleSchema = z.enum(['ORG_ADMIN', 'ORG_MANAGER', 'ORG_VIEWER'])
export const institutionMemberInviteSchema = z.object({ email: z.string().trim().email(), role: organizationRoleSchema })
export const institutionMemberUpdateSchema = z.object({ role: organizationRoleSchema })
export const institutionMembersSchema = z.object({ members: z.array(z.object({ id: idSchema, userId: idSchema, email: z.string().email(), status: z.string(), role: organizationRoleSchema, createdAt: z.coerce.date() })) })
export type InstitutionMemberInvite = z.infer<typeof institutionMemberInviteSchema>
export type InstitutionMemberUpdate = z.infer<typeof institutionMemberUpdateSchema>
export type InstitutionMembers = z.infer<typeof institutionMembersSchema>

export const privateTalentProfileSchema = z.object({
  user: z.object({ id: idSchema, email: z.string().email(), locale: localeSchema }),
  identity: z.object({ firstName: z.string(), lastName: z.string(), photoKey: z.string().nullable(), phone: z.string().nullable(), regionId: idSchema.nullable() }).nullable(),
  profile: talentProfileSchema.nullable(),
  minimumCompletion: z.number().int().min(0).max(100),
})
export const profileUpdateResponseSchema = z.object({ profile: talentProfileSchema, minimumCompletion: z.number().int().min(0).max(100) })

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

export const projectCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  pitch: z.string().trim().min(10).max(2_000),
  sectorId: idSchema.optional(),
  regionId: idSchema.optional(),
})
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>

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

export const importApplyInputSchema = z.object({
  batchId: idSchema,
})

export type ImportField = z.infer<typeof importFieldSchema>
export type ImportColumnMapping = z.infer<typeof importColumnMappingSchema>
export type ImportPreviewResult = z.infer<typeof importPreviewResultSchema>
export type ImportPreviewRow = z.infer<typeof importPreviewRowSchema>
export type ImportPreview = z.infer<typeof importPreviewSchema>
export type ImportApplyInput = z.infer<typeof importApplyInputSchema>

export type LoginInput = z.infer<typeof loginInputSchema>
export type ActivationInput = z.infer<typeof activationInputSchema>
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetInputSchema>
export type TalentProfileInput = z.infer<typeof talentProfileInputSchema>
export type TalentProfilePatchInput = z.infer<typeof talentProfilePatchSchema>
export type TalentIdentityInput = z.infer<typeof talentIdentityInputSchema>
export type OnboardingStepRequest = z.infer<typeof onboardingStepRequestSchema>
export type OnboardingProgress = z.infer<typeof onboardingProgressSchema>
export type TalentView = z.infer<typeof talentViewSchema>
export type ProjectSummary = z.infer<typeof projectSummarySchema>
export type ApiError = z.infer<typeof apiErrorSchema>

// ─── Applications (P-05) ───────────────────────────────────────────────────────

export const createApplicationInputSchema = z.object({
  projectId: idSchema,
  positionId: idSchema.optional(),
  message: z.string().trim().min(10, 'Le message de candidature doit contenir au moins 10 caractères').max(2000),
})

export const applicationItemSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  positionId: idSchema.nullable(),
  applicantId: idSchema,
  message: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']),
  rejectionReason: z.string().nullable(),
  decidedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  project: z.object({
    id: idSchema,
    title: z.string(),
    pitch: z.string(),
    status: z.nativeEnum(ProjectStatus),
  }),
  position: z
    .object({
      id: idSchema,
      title: z.string(),
      description: z.string().nullable(),
    })
    .nullable(),
})

export const myApplicationsResponseSchema = z.object({
  items: z.array(applicationItemSchema),
})

export type CreateApplicationInput = z.infer<typeof createApplicationInputSchema>
export type ApplicationItem = z.infer<typeof applicationItemSchema>
export type MyApplicationsResponse = z.infer<typeof myApplicationsResponseSchema>


// ─── Applications porteur (P-06) ───────────────────────────────────────────────

export const rejectApplicationInputSchema = z.object({
  rejectionReason: z.string().trim().min(3).max(500),
})

export const ownerApplicationItemSchema = applicationItemSchema.extend({
  candidate: z.object({
    pseudonym: z.string(),
    avatarSeed: z.string(),
    headline: z.string().nullable(),
  }),
})

export const ownerApplicationsResponseSchema = z.object({
  items: z.array(ownerApplicationItemSchema),
})

export type RejectApplicationInput = z.infer<typeof rejectApplicationInputSchema>
export type OwnerApplicationItem = z.infer<typeof ownerApplicationItemSchema>
export type OwnerApplicationsResponse = z.infer<typeof ownerApplicationsResponseSchema>
