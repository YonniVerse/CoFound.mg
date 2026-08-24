import { PlatformRole, StaffRole } from '@prisma/client'

export type SeedAccountInput = {
  email: string
  password: string
  platformRole: PlatformRole
  staffRole: StaffRole | null
  locale: string
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
const PLATFORM_ROLES = Object.values(PlatformRole)
const STAFF_ROLES = Object.values(StaffRole)

function isPlatformRole(value: unknown): value is PlatformRole {
  return typeof value === 'string' && PLATFORM_ROLES.includes(value as PlatformRole)
}

function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === 'string' && STAFF_ROLES.includes(value as StaffRole)
}

export function readSeedAccounts(env: NodeJS.ProcessEnv = process.env): SeedAccountInput[] {
  const raw = env.SEED_ACCOUNTS_JSON ?? env.ADMIN_ACCOUNTS_JSON
  if (!raw) {
    throw new Error('SEED_ACCOUNTS_JSON est obligatoire pour exécuter le seed des comptes.')
  }
  return parseSeedAccounts(raw)
}

export function parseSeedAccounts(raw: string): SeedAccountInput[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('SEED_ACCOUNTS_JSON doit être un tableau JSON valide.')
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('SEED_ACCOUNTS_JSON doit contenir au moins un compte.')
  }

  const accounts = parsed.map((value, index): SeedAccountInput => {
    if (!value || typeof value !== 'object') {
      throw new Error(`Le compte #${index + 1} est invalide.`)
    }

    const account = value as Record<string, unknown>
    const email = typeof account.email === 'string' ? account.email.trim().toLowerCase() : ''
    const password = typeof account.password === 'string' ? account.password : ''
    const platformRole = account.platformRole === undefined ? PlatformRole.STAFF : account.platformRole
    const locale = account.locale === undefined ? 'fr' : account.locale
    const staffRole = account.staffRole === undefined && platformRole === PlatformRole.STAFF
      ? StaffRole.SUPER_ADMIN
      : account.staffRole

    if (!email || !EMAIL_PATTERN.test(email)) {
      throw new Error(`L’adresse e-mail du compte #${index + 1} est invalide.`)
    }
    if (password.length < 12 || password.length > 128) {
      throw new Error(`Le mot de passe du compte #${index + 1} doit contenir entre 12 et 128 caractères.`)
    }
    if (!isPlatformRole(platformRole)) {
      throw new Error(`Le rôle de plateforme du compte #${index + 1} est invalide.`)
    }
    if (typeof locale !== 'string' || locale.trim().length < 2 || locale.trim().length > 8) {
      throw new Error(`La locale du compte #${index + 1} est invalide.`)
    }

    if (platformRole === PlatformRole.STAFF) {
      if (!isStaffRole(staffRole)) {
        throw new Error(`Le rôle staff du compte #${index + 1} est invalide.`)
      }
    } else if (staffRole !== undefined && staffRole !== null) {
      throw new Error(`Le compte #${index + 1} ne peut pas avoir de staffRole sans platformRole=STAFF.`)
    }

    return {
      email,
      password,
      platformRole,
      staffRole: platformRole === PlatformRole.STAFF ? staffRole as StaffRole : null,
      locale: locale.trim(),
    }
  })

  const emails = new Set<string>()
  for (const account of accounts) {
    if (emails.has(account.email)) {
      throw new Error(`L’adresse ${account.email} apparaît plusieurs fois.`)
    }
    emails.add(account.email)
  }

  return accounts
}
