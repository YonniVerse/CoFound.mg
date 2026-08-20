/**
 * Invariants du domaine partagés par le web et l'API.
 *
 * Ces valeurs portent des règles produit, pas des réglages techniques : les changer
 * change une promesse faite aux utilisateurs. Elles vivent ici pour qu'il n'en existe
 * qu'une seule définition.
 */

/**
 * Seuil minimal d'agrégation pour toute statistique publiée.
 *
 * Sans lui, « 1 femme sur 3 en M1 Télécom » désigne quelqu'un. Aucun tableau de bord —
 * établissement, partenaire ou staff — ne doit exposer un chiffre portant sur moins
 * d'individus que ce seuil.
 *
 * Référence : docs/specs-fonctionnelles.md TR-09
 */
export const MIN_AGGREGATION_THRESHOLD = 5

/** Durée de validité d'une invitation, en jours. Relançable. */
export const INVITATION_EXPIRY_DAYS = 30

/** Durée de vie du jeton d'accès, en minutes. Gardé en mémoire du client, jamais persisté. */
export const ACCESS_TOKEN_TTL_MINUTES = 15

/** Durée de vie du jeton de rafraîchissement, en jours. Cookie httpOnly, rotation à chaque usage. */
export const REFRESH_TOKEN_TTL_DAYS = 30

/**
 * Complétion minimale du profil, en pourcentage, pour apparaître dans le matching
 * et le Feed Talents. L'onboarding est progressif : on n'exige pas 100 %.
 */
export const MIN_PROFILE_COMPLETION = 60

/** Nombre maximal de demandes de contact en attente. Garde-fou anti-démarchage. */
export const MAX_PENDING_CONNECTION_REQUESTS = 10

/**
 * Nombre de messages de contact qu'un partenaire peut adresser à un talent ou à un
 * projet. Sans réponse, pas de relance : on ne vend pas le droit de harceler.
 */
export const PARTNER_CONTACT_MESSAGE_LIMIT = 1

/** Délai avant relance automatique du porteur sur une candidature sans réponse, en jours. */
export const APPLICATION_REMINDER_DAYS = 7

/** Côté le plus long d'un avatar après redimensionnement côté client, en pixels. */
export const AVATAR_MAX_DIMENSION = 512

/** Devise par défaut. Tout montant porte la sienne — voir décision D11. */
export const DEFAULT_CURRENCY = 'MGA'

/** Langues prévues. L'architecture i18n est en place dès le premier écran. */
export const SUPPORTED_LOCALES = ['fr', 'mg'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'
