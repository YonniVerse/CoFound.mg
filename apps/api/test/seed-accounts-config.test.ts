import assert from 'node:assert/strict'
import test from 'node:test'
import { PlatformRole, StaffRole } from '@prisma/client'
import { isAutoSeedEnabled } from '../src/account-seed/auto-seed.js'
import { parseSeedAccounts, readSeedAccounts } from '../src/account-seed/seed-accounts-config.js'

const password = 'mot-de-passe-test-12'

function json(value: unknown): string {
  return JSON.stringify(value)
}

test('parse les comptes de plusieurs rôles et applique les valeurs par défaut staff', () => {
  const accounts = parseSeedAccounts(json([
    { email: ' SUPER@EXAMPLE.MG ', password },
    { email: 'talent@example.mg', password, platformRole: PlatformRole.TALENT },
    { email: 'org@example.mg', password, platformRole: PlatformRole.ORG_MEMBER, locale: 'mg' },
    { email: 'moderator@example.mg', password, platformRole: PlatformRole.STAFF, staffRole: StaffRole.MODERATOR },
  ]))

  assert.deepEqual(accounts, [
    { email: 'super@example.mg', password, platformRole: PlatformRole.STAFF, staffRole: StaffRole.SUPER_ADMIN, locale: 'fr' },
    { email: 'talent@example.mg', password, platformRole: PlatformRole.TALENT, staffRole: null, locale: 'fr' },
    { email: 'org@example.mg', password, platformRole: PlatformRole.ORG_MEMBER, staffRole: null, locale: 'mg' },
    { email: 'moderator@example.mg', password, platformRole: PlatformRole.STAFF, staffRole: StaffRole.MODERATOR, locale: 'fr' },
  ])
})

test('privilégie SEED_ACCOUNTS_JSON tout en acceptant ADMIN_ACCOUNTS_JSON en compatibilité', () => {
  const accounts = readSeedAccounts({
    SEED_ACCOUNTS_JSON: json([{ email: 'new@example.mg', password, platformRole: PlatformRole.TALENT }]),
    ADMIN_ACCOUNTS_JSON: json([{ email: 'legacy@example.mg', password }]),
  })
  assert.equal(accounts[0]?.email, 'new@example.mg')

  const legacyAccounts = readSeedAccounts({ ADMIN_ACCOUNTS_JSON: json([{ email: 'legacy@example.mg', password }]) })
  assert.equal(legacyAccounts[0]?.email, 'legacy@example.mg')
})

test('n’active l’auto-seed que par configuration explicite', () => {
  assert.equal(isAutoSeedEnabled({}), false)
  assert.equal(isAutoSeedEnabled({ SEED_ACCOUNTS_JSON: '[]' }), false)
  assert.equal(isAutoSeedEnabled({ SEED_ACCOUNTS_ON_START: 'true' }), false)
  assert.equal(isAutoSeedEnabled({ SEED_ACCOUNTS_ON_START: 'true', SEED_ACCOUNTS_JSON: '[]' }), true)
  assert.equal(isAutoSeedEnabled({ SEED_ACCOUNTS_ON_START: 'TRUE', SEED_ACCOUNTS_JSON: '[]' }), true)
  assert.equal(isAutoSeedEnabled({ NODE_ENV: 'production', SEED_ACCOUNTS_ON_START: 'true', SEED_ACCOUNTS_JSON: '[]' }), false)
  assert.equal(isAutoSeedEnabled({ NODE_ENV: 'production', SEED_ACCOUNTS_MODE: 'development', SEED_ACCOUNTS_ON_START: 'true', SEED_ACCOUNTS_JSON: '[]' }), true)
})

test('refuse un rôle staff sur un compte non-STAFF', () => {
  assert.throws(
    () => parseSeedAccounts(json([{ email: 'talent@example.mg', password, platformRole: PlatformRole.TALENT, staffRole: StaffRole.MODERATOR }])),
    /ne peut pas avoir de staffRole/,
  )
})

test('refuse les rôles inconnus et les doublons d’adresse', () => {
  assert.throws(
    () => parseSeedAccounts(json([{ email: 'user@example.mg', password, platformRole: 'UNKNOWN' }])),
    /rôle de plateforme.*invalide/,
  )
  assert.throws(
    () => parseSeedAccounts(json([
      { email: 'user@example.mg', password },
      { email: ' USER@example.mg ', password },
    ])),
    /apparaît plusieurs fois/,
  )
})
