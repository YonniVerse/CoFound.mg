import type { PrismaService } from '../prisma/prisma.service.js'
import { readSeedAccounts } from './seed-accounts-config.js'

const ENABLED_VALUE = 'true'

export function isAutoSeedEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const explicitlyEnabled = env.SEED_ACCOUNTS_ON_START?.trim().toLowerCase() === ENABLED_VALUE
  const hasConfiguration = Boolean(env.SEED_ACCOUNTS_JSON)
  const isDevelopmentEnvironment = env.NODE_ENV !== 'production' || env.SEED_ACCOUNTS_MODE?.trim().toLowerCase() === 'development'
  return explicitlyEnabled && hasConfiguration && isDevelopmentEnvironment
}

export async function runAutoSeed(prisma: PrismaService, env: NodeJS.ProcessEnv = process.env): Promise<void> {
  if (!isAutoSeedEnabled(env)) return

  const accounts = readSeedAccounts(env)
  const { upsertSeedAccounts } = await import('./seed-accounts.js')
  await upsertSeedAccounts(prisma, accounts)

  const count = accounts.length
  console.log(`Auto-seed des comptes terminé pour ${count} compte(s).`)
}
