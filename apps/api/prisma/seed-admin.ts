import * as argon2 from 'argon2'
import { PrismaClient, StaffRole } from '@prisma/client'

const prisma = new PrismaClient()

type AdminSeedInput = {
  email: string
  password: string
  staffRole?: StaffRole
  locale?: string
}

function readAdminAccounts(): AdminSeedInput[] {
  const raw = process.env.ADMIN_ACCOUNTS_JSON
  if (!raw) {
    throw new Error('ADMIN_ACCOUNTS_JSON est obligatoire pour exécuter le seed admin.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('ADMIN_ACCOUNTS_JSON doit être un tableau JSON valide.')
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('ADMIN_ACCOUNTS_JSON doit contenir au moins un compte.')
  }

  const accounts = parsed.map((value, index) => {
    if (!value || typeof value !== 'object') {
      throw new Error(`Le compte admin #${index + 1} est invalide.`)
    }
    const account = value as Record<string, unknown>
    const email = typeof account.email === 'string' ? account.email.trim().toLowerCase() : ''
    const password = typeof account.password === 'string' ? account.password : ''
    const staffRole = account.staffRole === undefined ? StaffRole.SUPER_ADMIN : account.staffRole
    const locale = account.locale === undefined ? 'fr' : account.locale

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error(`L’adresse e-mail du compte admin #${index + 1} est invalide.`)
    }
    if (password.length < 12 || password.length > 128) {
      throw new Error(`Le mot de passe du compte admin #${index + 1} doit contenir entre 12 et 128 caractères.`)
    }
    if (staffRole !== StaffRole.SUPER_ADMIN && staffRole !== StaffRole.OPS_ADMIN && staffRole !== StaffRole.MODERATOR) {
      throw new Error(`Le rôle du compte admin #${index + 1} est invalide.`)
    }
    if (typeof locale !== 'string' || locale.length < 2 || locale.length > 8) {
      throw new Error(`La locale du compte admin #${index + 1} est invalide.`)
    }

    return { email, password, staffRole, locale }
  })

  const emails = new Set<string>()
  for (const account of accounts) {
    if (emails.has(account.email)) throw new Error(`L’adresse ${account.email} apparaît plusieurs fois.`)
    emails.add(account.email)
  }
  return accounts
}

async function seedAdmins(): Promise<void> {
  const accounts = readAdminAccounts()
  const activatedAt = new Date()

  await prisma.$transaction(async (tx) => {
    for (const account of accounts) {
      const passwordHash = await argon2.hash(account.password, { type: argon2.argon2id })
      await tx.user.upsert({
        where: { email: account.email },
        update: {
          passwordHash,
          status: 'ACTIVE',
          platformRole: 'STAFF',
          staffRole: account.staffRole,
          locale: account.locale,
          activatedAt,
        },
        create: {
          email: account.email,
          passwordHash,
          status: 'ACTIVE',
          platformRole: 'STAFF',
          staffRole: account.staffRole,
          locale: account.locale,
          activatedAt,
        },
      })
    }
  })

  console.log(`Seed admin terminé pour ${accounts.length} compte(s) : ${accounts.map(({ email, staffRole }) => `${email} (${staffRole})`).join(', ')}`)
}

seedAdmins()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
