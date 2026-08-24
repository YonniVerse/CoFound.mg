import * as argon2 from 'argon2'
import { PrismaClient, PlatformRole } from '@prisma/client'
import { readSeedAccounts } from './seed-accounts-config.js'

const prisma = new PrismaClient()

async function seedAccounts(): Promise<void> {
  const accounts = readSeedAccounts()
  const activatedAt = new Date()

  await prisma.$transaction(async (tx) => {
    for (const account of accounts) {
      const passwordHash = await argon2.hash(account.password, { type: argon2.argon2id })
      await tx.user.upsert({
        where: { email: account.email },
        update: {
          passwordHash,
          status: 'ACTIVE',
          platformRole: account.platformRole,
          staffRole: account.staffRole,
          locale: account.locale,
          activatedAt,
        },
        create: {
          email: account.email,
          passwordHash,
          status: 'ACTIVE',
          platformRole: account.platformRole,
          staffRole: account.staffRole,
          locale: account.locale,
          activatedAt,
        },
      })
    }
  })

  const roleSummary = accounts.map(({ email, platformRole, staffRole }) => {
    const role = platformRole === PlatformRole.STAFF ? `${platformRole}/${staffRole}` : platformRole
    return `${email} (${role})`
  })
  console.log(`Seed des comptes terminé pour ${accounts.length} compte(s) : ${roleSummary.join(', ')}`)
}

seedAccounts()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
