import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { BadRequestException } from '@nestjs/common'
import { ReportService } from '../src/report/report.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

test('M-14 crée un signalement dans une transaction', async () => {
  let transactionUsed = false
  const prisma = {
    $transaction: async (callback: (tx: { report: { create: (args: unknown) => Promise<unknown> } }) => Promise<unknown>) => {
      transactionUsed = true
      return callback({ report: { create: async () => ({ id: 'report-1', targetType: 'PROFILE', targetId: 'talent-2', reason: 'SPAM', status: 'OPEN' }) } })
    },
  } as unknown as PrismaService
  const result = await new ReportService(prisma).create('user-1', { targetType: 'PROFILE', targetId: 'talent-2', reason: 'SPAM' })
  assert.deepEqual(result, { id: 'report-1', targetType: 'PROFILE', targetId: 'talent-2', reason: 'SPAM', status: 'OPEN' })
  assert.equal(transactionUsed, true)
})

test('M-14 refuse une cible ou une raison inconnue avant toute écriture', async () => {
  const prisma = { $transaction: async () => { throw new Error('ne doit pas écrire') } } as unknown as PrismaService
  await assert.rejects(() => new ReportService(prisma).create('user-1', { targetType: 'IDENTITY', targetId: 'x', reason: 'UNKNOWN' }), (error: unknown) => error instanceof BadRequestException)
})


test('S-01 retourne la file priorisée avec pagination curseur', async () => {
  const prisma = {
    report: {
      findMany: async () => [
        { id: 'report-2', targetType: 'MESSAGE', targetId: 'message-2', reason: 'HARASSMENT', description: null, status: 'OPEN', priority: 10, createdAt: new Date(), assignedToId: null },
        { id: 'report-1', targetType: 'PROFILE', targetId: 'profile-1', reason: 'SPAM', description: 'À vérifier', status: 'OPEN', priority: 5, createdAt: new Date(), assignedToId: null },
      ],
    },
  } as unknown as PrismaService
  const result = await new ReportService(prisma).list({ status: 'OPEN', limit: 1 })
  assert.equal(result.items.length, 1)
  assert.equal(result.items[0]?.id, 'report-2')
  assert.equal(result.hasMore, true)
  assert.equal(result.nextCursor, 'report-2')
})

test('S-02 applique une sanction et le gel dans une transaction', async () => {
  let actionCreated = false
  let userUpdated = false
  const current = { id: 'report-1', reporterId: 'reporter-1', status: 'OPEN', targetType: 'PROFILE', targetId: 'profile-1' }
  const prisma = {
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback({
      report: { findUnique: async () => current, update: async () => ({ ...current, status: 'RESOLVED', assignedToId: 'moderator-1', resolvedAt: new Date() }) },
      user: { findUnique: async () => ({ id: 'target-1' }), update: async () => { userUpdated = true; return { id: 'target-1', status: 'FROZEN' } } },
      moderationAction: { create: async () => { actionCreated = true; return { id: 'action-1' } } },
    }),
  } as unknown as PrismaService
  const result = await new ReportService(prisma).decide('moderator-1', 'report-1', { status: 'RESOLVED', action: 'FREEZE', targetUserId: 'target-1', reason: 'Motif critique', durationDays: 7 })
  assert.equal(result.status, 'RESOLVED')
  assert.equal(actionCreated, true)
  assert.equal(userUpdated, true)
})

test('S-04 retourne l’identité ciblée et écrit un audit sans exposer le genre', async () => {
  const auditCalls: unknown[] = []
  const prisma = {
    report: { findUnique: async () => ({ id: 'report-1', targetType: 'PROFILE', targetId: 'profile-1', reason: 'FRAUD' }) },
    talentProfile: { findUnique: async () => ({ userId: 'target-1' }) },
    user: { findUnique: async () => ({ id: 'target-1', email: 'target@example.test', talentIdentity: { firstName: 'Aina', lastName: 'R.' } }) },
  } as unknown as PrismaService
  const audit = { record: async (event: unknown) => { auditCalls.push(event) } }
  const result = await new ReportService(prisma, undefined, audit as never).revealIdentity('moderator-1', 'report-1')
  assert.deepEqual(result.firstName, 'Aina')
  assert.equal('gender' in result, false)
  assert.equal(auditCalls.length, 1)
})
