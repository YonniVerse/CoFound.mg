/**
 * Énumérations du domaine CoFound.mg.
 *
 * Source de vérité partagée par `apps/web` et `apps/api`.
 * Toute valeur ajoutée ici doit l'être aussi dans le schéma Prisma correspondant.
 *
 * Référence : docs/modele-de-donnees.md
 */

/* ------------------------------------------------------------------ */
/* Comptes et identité                                                 */
/* ------------------------------------------------------------------ */

/**
 * Cycle de vie d'un compte.
 *
 * Il n'y a pas d'inscription publique (décision D1) : un compte naît `INVITED`,
 * créé par l'import d'un établissement ou par le staff.
 */
export const AccountStatus = {
  /** Compte créé, invitation envoyée, jamais activé */
  INVITED: 'INVITED',
  ACTIVE: 'ACTIVE',
  /** Sanction de modération — accès réduit à la notification de sanction */
  FROZEN: 'FROZEN',
  /** Fin de cursus — conserve ses projets, sort du matching et du Feed Talents */
  LEAVING: 'LEAVING',
  /** Peut mentorer, ne peut plus candidater */
  ALUMNI: 'ALUMNI',
  /** Accès coupé, données conservées */
  DISABLED: 'DISABLED',
} as const
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus]

export const AffiliationStatus = {
  ACTIVE: 'ACTIVE',
  LEAVING: 'LEAVING',
  ALUMNI: 'ALUMNI',
  SUSPENDED: 'SUSPENDED',
} as const
export type AffiliationStatus = (typeof AffiliationStatus)[keyof typeof AffiliationStatus]

/* ------------------------------------------------------------------ */
/* Organisations                                                       */
/* ------------------------------------------------------------------ */

export const OrganizationType = {
  INSTITUTION: 'INSTITUTION',
  INCUBATOR: 'INCUBATOR',
  COMPANY: 'COMPANY',
  NGO: 'NGO',
  PUBLIC: 'PUBLIC',
  ASSOCIATION: 'ASSOCIATION',
} as const
export type OrganizationType = (typeof OrganizationType)[keyof typeof OrganizationType]

/**
 * Capacités accordées par le staff, organisation par organisation.
 *
 * C'est ce qui remplace les rôles plats du cahier des charges initial (décision D3) :
 * ajouter un type d'organisation ne demande aucun nouvel arbre de permissions.
 */
export const OrganizationCapability = {
  /** Réservée aux établissements (décision D4) — c'est ce qui donne sa valeur au badge */
  CERTIFY_AFFILIATION: 'CERTIFY_AFFILIATION',
  PUBLISH_OPPORTUNITY: 'PUBLISH_OPPORTUNITY',
  RECRUIT: 'RECRUIT',
  /** V2 */
  MENTOR: 'MENTOR',
  /** V2 */
  FUND: 'FUND',
  /** V2 */
  SURVEY: 'SURVEY',
  /** V2 */
  ANALYTICS: 'ANALYTICS',
} as const
export type OrganizationCapability =
  (typeof OrganizationCapability)[keyof typeof OrganizationCapability]

/** Capacités activables dans le MVP. Les autres existent dans le modèle sans être accordées. */
export const MVP_CAPABILITIES = [
  OrganizationCapability.CERTIFY_AFFILIATION,
  OrganizationCapability.PUBLISH_OPPORTUNITY,
  OrganizationCapability.RECRUIT,
] as const

/* ------------------------------------------------------------------ */
/* Rôles                                                               */
/* ------------------------------------------------------------------ */

export const PlatformRole = {
  TALENT: 'TALENT',
  ORG_MEMBER: 'ORG_MEMBER',
  STAFF: 'STAFF',
} as const
export type PlatformRole = (typeof PlatformRole)[keyof typeof PlatformRole]

export const OrganizationRole = {
  ORG_ADMIN: 'ORG_ADMIN',
  ORG_MANAGER: 'ORG_MANAGER',
  ORG_VIEWER: 'ORG_VIEWER',
} as const
export type OrganizationRole = (typeof OrganizationRole)[keyof typeof OrganizationRole]

export const ProjectRole = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
  /** V2 */
  MENTOR: 'MENTOR',
  /** V2 */
  OBSERVER: 'OBSERVER',
} as const
export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole]

export const StaffRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OPS_ADMIN: 'OPS_ADMIN',
  MODERATOR: 'MODERATOR',
} as const
export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole]

/* ------------------------------------------------------------------ */
/* Projets                                                             */
/* ------------------------------------------------------------------ */

/**
 * Cinq états dans le MVP, contre neuf dans le cahier des charges.
 * Les quatre manquants s'ajouteront par une valeur, sans migration de schéma.
 *
 * Seule transition contrainte : `DRAFT → RECRUITING` exige un BMC complet (décision D6).
 */
export const ProjectStatus = {
  DRAFT: 'DRAFT',
  RECRUITING: 'RECRUITING',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED',
} as const
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export const TaskStatus = {
  TODO: 'TODO',
  DOING: 'DOING',
  BLOCKED: 'BLOCKED',
  DONE: 'DONE',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const ApplicationStatus = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  WAITLISTED: 'WAITLISTED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export const PostType = {
  SEEKING_COLLABORATOR: 'SEEKING_COLLABORATOR',
  SEEKING_MENTORSHIP: 'SEEKING_MENTORSHIP',
  SEEKING_FUNDING: 'SEEKING_FUNDING',
  UPDATE: 'UPDATE',
} as const
export type PostType = (typeof PostType)[keyof typeof PostType]

/** Les neuf blocs du Business Model Canvas, dans l'ordre d'affichage. */
export const BMC_BLOCKS = [
  'customerSegments',
  'valueProposition',
  'channels',
  'customerRelationships',
  'revenueStreams',
  'keyResources',
  'keyActivities',
  'keyPartners',
  'costStructure',
] as const
export type BmcBlock = (typeof BMC_BLOCKS)[number]

/* ------------------------------------------------------------------ */
/* Mise en relation et messagerie                                      */
/* ------------------------------------------------------------------ */

export const ConnectionRequestStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  /** Refus silencieux : l'émetteur voit « sans réponse », jamais « refusé » */
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const
export type ConnectionRequestStatus =
  (typeof ConnectionRequestStatus)[keyof typeof ConnectionRequestStatus]

export const ConnectionSource = {
  MATCH: 'MATCH',
  /** Dévoilement automatique à l'entrée dans un projet commun */
  PROJECT: 'PROJECT',
} as const
export type ConnectionSource = (typeof ConnectionSource)[keyof typeof ConnectionSource]

export const ConversationType = {
  DIRECT: 'DIRECT',
  PROJECT: 'PROJECT',
} as const
export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType]

/* ------------------------------------------------------------------ */
/* Import                                                              */
/* ------------------------------------------------------------------ */

export const ImportBatchStatus = {
  /** Analysé et prévisualisé — aucun compte créé */
  PREVIEW: 'PREVIEW',
  APPLIED: 'APPLIED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const
export type ImportBatchStatus = (typeof ImportBatchStatus)[keyof typeof ImportBatchStatus]

export const ImportRowResult = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  /** Garantit l'idempotence : un ré-import ne duplique rien */
  SKIPPED_DUPLICATE: 'SKIPPED_DUPLICATE',
  ERROR: 'ERROR',
  /** Écrit par le webhook de rebond, après coup — remonte dans le rapport de l'établissement */
  BOUNCED: 'BOUNCED',
} as const
export type ImportRowResult = (typeof ImportRowResult)[keyof typeof ImportRowResult]

/* ------------------------------------------------------------------ */
/* Opportunités                                                        */
/* ------------------------------------------------------------------ */

/**
 * Entité unique typée (décision D10) : sondages, concours, événements, appels et
 * offres de stage partagent le même modèle. Activer un type est de la configuration.
 */
export const OpportunityType = {
  /** Seul type activé dans le MVP */
  CALL_FOR_APPLICATIONS: 'CALL_FOR_APPLICATIONS',
  CONTEST: 'CONTEST',
  INCUBATION_PROGRAM: 'INCUBATION_PROGRAM',
  FUNDING_OFFER: 'FUNDING_OFFER',
  EVENT: 'EVENT',
  INTERNSHIP: 'INTERNSHIP',
} as const
export type OpportunityType = (typeof OpportunityType)[keyof typeof OpportunityType]

export const ApplicantType = {
  TALENT: 'TALENT',
  PROJECT: 'PROJECT',
} as const
export type ApplicantType = (typeof ApplicantType)[keyof typeof ApplicantType]

/* ------------------------------------------------------------------ */
/* Modération                                                          */
/* ------------------------------------------------------------------ */

export const ReportReason = {
  HARASSMENT: 'HARASSMENT',
  HATE_SPEECH: 'HATE_SPEECH',
  SPAM: 'SPAM',
  FRAUD: 'FRAUD',
  TOXIC_CONTENT: 'TOXIC_CONTENT',
} as const
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason]

/** Motifs déclenchant un gel automatique temporaire, avant analyse humaine. */
export const CRITICAL_REPORT_REASONS = [
  ReportReason.HARASSMENT,
  ReportReason.HATE_SPEECH,
] as const

export const ModerationActionType = {
  WARNING: 'WARNING',
  FREEZE: 'FREEZE',
  DISABLE: 'DISABLE',
  CONTENT_REMOVED: 'CONTENT_REMOVED',
} as const
export type ModerationActionType =
  (typeof ModerationActionType)[keyof typeof ModerationActionType]

/* ------------------------------------------------------------------ */
/* Frontière financière                                                */
/* ------------------------------------------------------------------ */

export const FinancialEngagementType = {
  INVESTMENT: 'INVESTMENT',
  DONATION: 'DONATION',
  GRANT: 'GRANT',
  PRIZE: 'PRIZE',
} as const
export type FinancialEngagementType =
  (typeof FinancialEngagementType)[keyof typeof FinancialEngagementType]

export const FinancialEngagementStatus = {
  PROPOSED: 'PROPOSED',
  ACCEPTED: 'ACCEPTED',
  SETTLING: 'SETTLING',
  /** Confirmé par les deux parties */
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const
export type FinancialEngagementStatus =
  (typeof FinancialEngagementStatus)[keyof typeof FinancialEngagementStatus]

/**
 * Fournisseur de règlement.
 *
 * Décision D5 : aucun flux monétaire ne transite par la plateforme, même après
 * partenariat opérateur. `MOBILE_MONEY` initiera un paiement dont le bénéficiaire
 * est l'équipe — CoFound n'est jamais détenteur des fonds.
 */
export const PaymentProvider = {
  /** Seule implémentation en V1 : confirmation déclarative bilatérale */
  OFF_PLATFORM: 'OFF_PLATFORM',
  /** V2 */
  MOBILE_MONEY: 'MOBILE_MONEY',
} as const
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider]
