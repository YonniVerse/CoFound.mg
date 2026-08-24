import { PrismaClient, PlatformRole } from '@prisma/client'
import { readSeedAccounts } from '../src/account-seed/seed-accounts-config.js'
import { upsertSeedAccounts } from '../src/account-seed/seed-accounts.js'

const prisma = new PrismaClient()

async function seedAccounts(): Promise<void> {
  const accounts = readSeedAccounts()
  await upsertSeedAccounts(prisma, accounts)

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
