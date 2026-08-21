import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { ConsentService } from '../src/consent/consent.service.js'

const consent = { id: 'consent-1', userId: 'user-1', purpose: 'PROFILE_VISIBILITY', policyVersion: 'v1', grantedAt: new Date('2026-08-21T00:00:00Z'), revokedAt: null }

test('E-15 liste uniquement les consentements de l’utilisateur courant', async () => {
  const prisma = { consent: { findMany: async ({ where }: { where: { userId: string } }) => where.userId === 'user-1' ? [consent] : [] } } as unknown as PrismaService
  const result = await new ConsentService(prisma).listMine('user-1')
  assert.equal(result.consents.length, 1)
  assert.equal(result.consents[0]?.active, true)
  assert.equal(result.consents[0]?.purpose, 'PROFILE_VISIBILITY')
})

test('E-15 rend l’octroi idempotent pour la même finalité et version', async () => {
  let creates = 0
  const transaction = { consent: { findFirst: async () => consent, update: async () => consent, create: async () => { creates += 1; return consent } } }
  const prisma = { $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction) } as unknown as PrismaService
  const result = await new ConsentService(prisma).grant('user-1', 'PROFILE_VISIBILITY', { policyVersion: 'v1' })
  assert.equal(result.active, true)
  assert.equal(creates, 0)
})

test('E-15 retire un consentement uniquement avec confirmation explicite', async () => {
  let revoked = false
  const prisma = { consent: { findFirst: async () => consent, update: async ({ data }: { data: { revokedAt: Date } }) => { revoked = data.revokedAt instanceof Date; return { ...consent, revokedAt: data.revokedAt } } } } as unknown as PrismaService
  const result = await new ConsentService(prisma).revoke('user-1', 'PROFILE_VISIBILITY', { confirm: true })
  assert.equal(result.active, false)
  assert.equal(revoked, true)
  await assert.rejects(() => new ConsentService(prisma).revoke('user-1', 'PROFILE_VISIBILITY', { confirm: false }), /Bad Request Exception/)
})

test('E-15 refuse une finalité inconnue', async () => {
  const prisma = {} as PrismaService
  await assert.rejects(() => new ConsentService(prisma).grant('user-1', 'UNKNOWN', { policyVersion: 'v1' }), /Bad Request Exception/)
})
