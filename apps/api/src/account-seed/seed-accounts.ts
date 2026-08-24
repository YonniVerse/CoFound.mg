import * as argon2 from 'argon2'
import type { PrismaClient } from '@prisma/client'
import type { SeedAccountInput } from './seed-accounts-config.js'

export async function upsertSeedAccounts(prisma: PrismaClient, accounts: SeedAccountInput[]): Promise<void> {
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
}
