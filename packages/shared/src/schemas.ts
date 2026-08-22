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
export const profileCompletionReminderSchema = z.object({ shouldRemind: z.boolean(), completion: z.number().int().min(0).max(100), minimumCompletion: z.number().int().min(0).max(100), missingFields: z.array(z.string()), ctaPath: z.literal('/onboarding') })
export type ProfileCompletionReminder = z.infer<typeof profileCompletionReminderSchema>
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
export const affiliationStatusSchema = z.enum(['ACTIVE', 'LEAVING', 'ALUMNI', 'SUSPENDED'])
export const affiliationFiltersSchema = z.object({ cohortYear: z.coerce.number().int().optional(), fieldId: idSchema.optional(), status: affiliationStatusSchema.optional() })
export const affiliationUpdateSchema = z.object({ status: affiliationStatusSchema })
export const affiliationBulkStatusSchema = z.object({ affiliationIds: z.array(idSchema).min(1).max(1000), status: affiliationStatusSchema, confirmation: z.string().min(1) })
export const institutionDirectoryQuerySchema = z.object({ organizationId: idSchema, search: z.string().trim().min(1).optional(), cohortYear: z.coerce.number().int().optional(), status: z.string().min(1).optional() })

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

export const BMC_BLOCK_KEYS = [
  'customerSegments',
  'valuePropositions',
  'channels',
  'customerRelationships',
  'revenueStreams',
  'keyResources',
  'keyActivities',
  'keyPartners',
  'costStructure',
] as const

export const bmcBlockKeySchema = z.enum(BMC_BLOCK_KEYS)
export const bmcBlockSchema = z.object({
  content: z.string().trim().max(4_000),
  isPublic: z.boolean().default(false),
})
export const bmcBlocksSchema = z.object(Object.fromEntries(BMC_BLOCK_KEYS.map((key) => [key, bmcBlockSchema])) as Record<typeof BMC_BLOCK_KEYS[number], typeof bmcBlockSchema>)
export const bmcPatchSchema = z.object({ block: bmcBlockKeySchema, value: bmcBlockSchema })
export const bmcResponseSchema = z.object({
  projectId: idSchema,
  blocks: bmcBlocksSchema,
  completion: z.number().int().min(0).max(100),
  completedBlocks: z.number().int().min(0).max(9),
  updatedAt: z.coerce.date().nullable(),
  updatedById: idSchema.nullable(),
})
export type BmcBlockKey = (typeof BMC_BLOCK_KEYS)[number]
export type BmcBlocks = z.infer<typeof bmcBlocksSchema>
export type BmcPatchInput = z.infer<typeof bmcPatchSchema>

export const projectSummarySchema = z.object({
  id: idSchema,
  title: z.string(),
  pitch: z.string(),
  status: z.nativeEnum(ProjectStatus),
  createdAt: z.coerce.date(),
})

export const accountStatusSchema = z.nativeEnum(AccountStatus)

export const searchTypeSchema = z.enum(['all', 'projects', 'talents', 'opportunities'])

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
  type: searchTypeSchema.default('all'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const projectSearchResultSchema = projectSummarySchema

export const talentSearchResultSchema = publicTalentViewSchema

export const opportunitySearchResultSchema = z.object({
  id: idSchema,
  title: z.string(),
  description: z.string(),
  opportunityType: z.string(),
  organizationName: z.string().optional(),
  createdAt: z.coerce.date(),
})

export const searchResponseSchema = z.object({
  query: z.string(),
  projects: z.array(projectSearchResultSchema),
  talents: z.array(talentSearchResultSchema),
  opportunities: z.array(opportunitySearchResultSchema),
  counts: z.object({
    projects: z.number().int().nonnegative(),
    talents: z.number().int().nonnegative(),
    opportunities: z.number().int().nonnegative(),
  }),
})

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
export type SearchType = z.infer<typeof searchTypeSchema>
export type SearchQuery = z.infer<typeof searchQuerySchema>
export type ProjectSearchResult = z.infer<typeof projectSearchResultSchema>
export type TalentSearchResult = z.infer<typeof talentSearchResultSchema>
export type OpportunitySearchResult = z.infer<typeof opportunitySearchResultSchema>
export type SearchResponse = z.infer<typeof searchResponseSchema>
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

// ─── Membres et rôles projet (P-08) ─────────────────────────────────────────────

export const projectRoleSchema = z.enum(['OWNER', 'MEMBER', 'MENTOR', 'OBSERVER'])

export const projectMemberItemSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  userId: idSchema,
  role: projectRoleSchema,
  functionalRole: z.string().nullable(),
  joinedAt: z.coerce.date(),
  displayName: z.string().nullable(),
  pseudonym: z.string().nullable(),
  avatarSeed: z.string().nullable(),
})

export const projectMembersResponseSchema = z.object({
  items: z.array(projectMemberItemSchema),
})

export const updateProjectMemberRoleSchema = z.object({
  role: projectRoleSchema,
})

export type ProjectRoleInput = z.infer<typeof projectRoleSchema>
export type ProjectMemberItem = z.infer<typeof projectMemberItemSchema>
export type ProjectMembersResponse = z.infer<typeof projectMembersResponseSchema>
export type UpdateProjectMemberRoleInput = z.infer<typeof updateProjectMemberRoleSchema>

export const addProjectMemberSchema = z.object({
  userId: idSchema,
  role: projectRoleSchema.default('MEMBER'),
})
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>

// ─── Postes ouverts (P-04) ───────────────────────────────────────────────────────

export const openPositionCreateSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2_000).optional().nullable(),
  expectedHours: z.number().int().min(1).max(168).optional().nullable(),
  skillIds: z.array(idSchema).min(1).max(8).refine((ids) => new Set(ids).size === ids.length, 'Compétences dupliquées.'),
})
export const openPositionPatchSchema = openPositionCreateSchema.partial().extend({ isOpen: z.boolean().optional() })
export const openPositionResponseSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  title: z.string(),
  description: z.string().nullable(),
  expectedHours: z.number().int().nullable(),
  isOpen: z.boolean(),
  skills: z.array(z.object({ id: idSchema, name: z.string() })),
})
export const projectPositionsResponseSchema = z.object({ projectId: idSchema, positions: z.array(openPositionResponseSchema) })
export type OpenPositionCreateInput = z.infer<typeof openPositionCreateSchema>
export type OpenPositionPatchInput = z.infer<typeof openPositionPatchSchema>

// ─── Tâches projet (P-09) ───────────────────────────────────────────────────────

export const taskStatusSchema = z.enum(['TODO', 'DOING', 'BLOCKED', 'DONE'])

export const createProjectTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4_000).optional().nullable(),
  assigneeId: idSchema.optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  status: taskStatusSchema.optional(),
})

export const updateProjectTaskSchema = createProjectTaskSchema.partial()

export const projectTaskSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  title: z.string(),
  description: z.string().nullable(),
  assigneeId: idSchema.nullable(),
  assigneePseudonym: z.string().nullable(),
  dueDate: z.coerce.date().nullable(),
  status: taskStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const projectTasksResponseSchema = z.object({
  projectId: idSchema,
  tasks: z.array(projectTaskSchema),
})

export type TaskStatusInput = z.infer<typeof taskStatusSchema>
export type CreateProjectTaskInput = z.infer<typeof createProjectTaskSchema>
export type UpdateProjectTaskInput = z.infer<typeof updateProjectTaskSchema>
export type ProjectTask = z.infer<typeof projectTaskSchema>
export type ProjectTasksResponse = z.infer<typeof projectTasksResponseSchema>

// ─── Publications projet (P-11) ───────────────────────────────────────────────
export const projectPostTypeSchema = z.enum(['SEEKING_COLLABORATOR', 'SEEKING_MENTORSHIP', 'SEEKING_FUNDING', 'UPDATE'])
export const projectPostCreateSchema = z.object({
  type: projectPostTypeSchema,
  content: z.string().trim().min(1).max(2000),
  sectorId: idSchema.nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
})
export const projectPostUpdateSchema = projectPostCreateSchema.partial()
export const projectPostSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  authorId: idSchema,
  authorPseudonym: z.string(),
  type: projectPostTypeSchema,
  content: z.string(),
  sectorId: idSchema.nullable(),
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})
export const projectPostsResponseSchema = z.object({ projectId: idSchema, posts: z.array(projectPostSchema) })
export type ProjectPostType = z.infer<typeof projectPostTypeSchema>
export type ProjectPostCreateInput = z.infer<typeof projectPostCreateSchema>
export type ProjectPostUpdateInput = z.infer<typeof projectPostUpdateSchema>
export type ProjectPost = z.infer<typeof projectPostSchema>
export type ProjectPostsResponse = z.infer<typeof projectPostsResponseSchema>

// ─── Détail projet public/privé (P-13) ─────────────────────────────────────────
export const publicProjectDetailSchema = z.object({
  id: idSchema,
  title: z.string(),
  pitch: z.string(),
  status: z.string(),
  sectorId: idSchema.nullable(),
  regionId: idSchema.nullable(),
  publicBmc: z.record(z.string(), z.object({ content: z.string(), isPublic: z.literal(true) })),
  members: z.array(z.object({ pseudonym: z.string(), avatarSeed: z.string().nullable(), role: z.string() })),
  positions: z.array(z.object({ id: idSchema, title: z.string(), description: z.string().nullable(), expectedHours: z.number().int().nullable() })),
  posts: z.array(z.object({ id: idSchema, type: z.string(), content: z.string(), createdAt: z.coerce.date() })),
})
export type PublicProjectDetail = z.infer<typeof publicProjectDetailSchema>

// ─── Mise en relation et messagerie (M-09 à M-11) ─────────────────────────────
export const contactRequestCreateSchema = z.object({
  toUserId: idSchema,
  message: z.string().trim().min(1).max(2_000),
})
export const contactRequestDecisionSchema = z.object({
  decision: z.enum(['ACCEPTED', 'DECLINED']),
})
export const contactRequestSchema = z.object({
  id: idSchema,
  fromUserId: idSchema,
  toUserId: idSchema,
  message: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export const connectionSchema = z.object({
  id: idSchema,
  userAId: idSchema,
  userBId: idSchema,
  revealedAt: z.coerce.date().nullable(),
  source: z.enum(['MATCH', 'PROJECT']),
  conversationId: idSchema.nullable(),
})
export const conversationSchema = z.object({
  id: idSchema,
  type: z.enum(['DIRECT', 'PROJECT']),
  projectId: idSchema.nullable(),
  createdAt: z.coerce.date(),
})
export const conversationMessageCreateSchema = z.object({
  body: z.string().trim().min(1).max(4_000),
  attachmentKey: z.string().trim().max(500).optional().nullable(),
})
export const conversationMessageSchema = z.object({
  id: idSchema,
  conversationId: idSchema,
  authorId: idSchema,
  authorPseudonym: z.string(),
  body: z.string(),
  attachmentKey: z.string().nullable(),
  createdAt: z.coerce.date(),
})
export type ContactRequestCreateInput = z.infer<typeof contactRequestCreateSchema>
export type ContactRequestDecisionInput = z.infer<typeof contactRequestDecisionSchema>
export type ContactRequest = z.infer<typeof contactRequestSchema>
export type ConnectionView = z.infer<typeof connectionSchema>
export type ConversationView = z.infer<typeof conversationSchema>
export type ConversationMessageCreateInput = z.infer<typeof conversationMessageCreateSchema>
export type ConversationMessage = z.infer<typeof conversationMessageSchema>
export const conversationMessagesResponseSchema = z.object({ items: z.array(conversationMessageSchema) })
export type ConversationMessagesResponse = z.infer<typeof conversationMessagesResponseSchema>
export const conversationListSchema = z.array(conversationSchema)
export const blockResultSchema = z.object({ blocked: z.boolean(), blockedId: idSchema })
export const blockedUserSchema = z.object({ blockedId: idSchema, createdAt: z.coerce.date() })
export const blockedUsersResponseSchema = z.array(blockedUserSchema)
export type BlockResult = z.infer<typeof blockResultSchema>
export const notificationSchema = z.object({ id: idSchema, userId: idSchema, type: z.string(), payload: z.unknown(), readAt: z.coerce.date().nullable(), createdAt: z.coerce.date() })
export const notificationsResponseSchema = z.array(notificationSchema)
export type NotificationView = z.infer<typeof notificationSchema>
export const projectFeedQuerySchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
  sectorId: idSchema.optional(),
  regionId: idSchema.optional(),
  search: z.string().trim().max(100).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const projectFeedCardSchema = z.object({
  id: idSchema,
  title: z.string(),
  pitch: z.string(),
  status: z.nativeEnum(ProjectStatus),
  createdAt: z.coerce.date(),
  sector: z.object({ id: idSchema, slug: z.string(), labelKey: z.string() }).nullable(),
  region: z.object({ id: idSchema, slug: z.string(), labelKey: z.string() }).nullable(),
  openPositionsCount: z.number().int().min(0),
  membersCount: z.number().int().min(0),
  owner: z.object({
    pseudonym: z.string(),
    avatarSeed: z.string(),
  }).nullable(),
})

export const projectFeedResponseSchema = z.object({
  items: z.array(projectFeedCardSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

// ─── Talent Feed (M-04) ───────────────────────────────────────────────────────

export const talentFeedQuerySchema = z.object({
  fieldId: idSchema.optional(),
  search: z.string().trim().max(100).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const talentFeedCardSchema = z.object({
  id: idSchema,
  pseudonym: z.string(),
  avatarSeed: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  field: z.object({ id: idSchema, slug: z.string(), labelKey: z.string() }).nullable(),
  cohortYear: z.number().int().nullable(),
  availabilityHours: z.number().int().nullable(),
  goals: z.array(z.string()),
  skills: z.array(z.object({ id: idSchema, slug: z.string(), labelKey: z.string() })),
  completion: z.number().int().min(0).max(100),
})

export const talentFeedResponseSchema = z.object({
  items: z.array(talentFeedCardSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

export type ProjectFeedQuery = z.infer<typeof projectFeedQuerySchema>
export type ProjectFeedCard = z.infer<typeof projectFeedCardSchema>
export type ProjectFeedResponse = z.infer<typeof projectFeedResponseSchema>

export type TalentFeedQuery = z.infer<typeof talentFeedQuerySchema>
export type TalentFeedCard = z.infer<typeof talentFeedCardSchema>
export type TalentFeedResponse = z.infer<typeof talentFeedResponseSchema>

// ─── Dream-Match (M-05) ───────────────────────────────────────────────────────

export const dreamMatchSkillInputSchema = z.object({
  skillId: idSchema,
  importance: z.number().int().min(1).max(5).default(1),
})

export const dreamMatchProfileUpsertSchema = z.object({
  minAvailability: z.number().int().min(0).max(168).nullable().optional(),
  preferredTeamSize: z.number().int().min(2).max(20).nullable().optional(),
  institutionPref: z.string().trim().max(160).nullable().optional(),
  sectors: z.array(idSchema).max(20).default([]),
  skills: z.array(dreamMatchSkillInputSchema).max(30).default([]),
})

export const dreamMatchProfileSchema = z.object({
  id: idSchema,
  talentId: idSchema,
  minAvailability: z.number().int().nullable(),
  preferredTeamSize: z.number().int().nullable(),
  institutionPref: z.string().nullable(),
  sectors: z.array(idSchema),
  skills: z.array(dreamMatchSkillInputSchema),
})

export const dreamMatchProfileResponseSchema = z.object({ profile: dreamMatchProfileSchema.nullable() })
export type DreamMatchSkillInput = z.infer<typeof dreamMatchSkillInputSchema>
export type DreamMatchProfileUpsertInput = z.infer<typeof dreamMatchProfileUpsertSchema>
export type DreamMatchProfile = z.infer<typeof dreamMatchProfileSchema>
export type DreamMatchProfileResponse = z.infer<typeof dreamMatchProfileResponseSchema>

export const dreamMatchConsentSchema = z.object({ consent: z.literal(true) })
export type DreamMatchConsentInput = z.infer<typeof dreamMatchConsentSchema>

export const dreamMatchUpsertRequestSchema = dreamMatchProfileUpsertSchema.extend({ consent: z.literal(true) })
export type DreamMatchUpsertRequest = z.infer<typeof dreamMatchUpsertRequestSchema>

export const dreamMatchUpsertResponseSchema = z.object({ profile: dreamMatchProfileSchema })
export type DreamMatchUpsertResponse = z.infer<typeof dreamMatchUpsertResponseSchema>


// ─── Dream-Match scoring (M-06) ───────────────────────────────────────────────

export const dreamMatchFactorSchema = z.object({
  skillComplementarity: z.number().min(0).max(50),
  sectorOverlap: z.number().min(0).max(25),
  availability: z.number().min(0).max(25),
})

export const dreamMatchSuggestionSchema = z.object({
  talentId: idSchema,
  pseudonym: z.string(),
  avatarSeed: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  score: z.number().min(0).max(100),
  factors: dreamMatchFactorSchema,
})

export const dreamMatchSuggestionsResponseSchema = z.object({
  items: z.array(dreamMatchSuggestionSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

export const dreamMatchSuggestionsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type DreamMatchFactor = z.infer<typeof dreamMatchFactorSchema>
export type DreamMatchSuggestion = z.infer<typeof dreamMatchSuggestionSchema>
export type DreamMatchSuggestionsResponse = z.infer<typeof dreamMatchSuggestionsResponseSchema>
export type DreamMatchSuggestionsQuery = z.infer<typeof dreamMatchSuggestionsQuerySchema>

// ─── Dream-Match feedback (M-08) ───────────────────────────────────────────────

export const dreamMatchNotInterestedResponseSchema = z.object({
  excluded: z.literal(true),
  talentId: idSchema,
})
export type DreamMatchNotInterestedResponse = z.infer<typeof dreamMatchNotInterestedResponseSchema>

// ─── Signalement transverse (M-14) ─────────────────────────────────────────────

export const reportTargetTypeSchema = z.enum(['PROFILE', 'MESSAGE', 'PROJECT', 'POST'])
export const reportReasonSchema = z.enum(['HARASSMENT', 'HATE_SPEECH', 'SPAM', 'FRAUD', 'TOXIC_CONTENT'])
export const reportCreateSchema = z.object({
  targetType: reportTargetTypeSchema,
  targetId: idSchema,
  reason: reportReasonSchema,
  description: z.string().trim().max(2000).nullable().optional(),
})
export const reportResponseSchema = z.object({
  id: idSchema,
  targetType: reportTargetTypeSchema,
  targetId: idSchema,
  reason: reportReasonSchema,
  status: z.literal('OPEN'),
})
export type ReportCreateInput = z.infer<typeof reportCreateSchema>
export type ReportResponse = z.infer<typeof reportResponseSchema>
export type ReportTargetType = z.infer<typeof reportTargetTypeSchema>

