import * as argon2 from 'argon2'
import type { PrismaClient } from '@prisma/client'
import type { SeedAccountInput } from './seed-accounts-config.js'

type PreparedSeedAccount = {
  account: SeedAccountInput
  passwordHash: string
}

export async function upsertSeedAccounts(prisma: PrismaClient, accounts: SeedAccountInput[]): Promise<void> {
  const activatedAt = new Date()
  const preparedAccounts: PreparedSeedAccount[] = []

  // Argon2 est volontairement exécuté hors transaction : son coût CPU peut
  // dépasser le timeout interactif Prisma lorsque plusieurs comptes sont seedés.
  for (const account of accounts) {
    preparedAccounts.push({
      account,
      passwordHash: await argon2.hash(account.password, { type: argon2.argon2id }),
    })
  }

  await prisma.$transaction(async (tx) => {
    for (const { account, passwordHash } of preparedAccounts) {
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
