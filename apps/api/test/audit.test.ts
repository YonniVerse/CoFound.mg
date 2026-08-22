import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { AuditService } from '../src/audit/audit.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

test('S-05 retourne les journaux filtrés avec pagination curseur', async () => {
  let receivedWhere: unknown
  const prisma = {
    auditLog: {
      findMany: async (args: { where: unknown }) => {
        receivedWhere = args.where
        return [
          { id: 'audit-2', createdAt: new Date('2026-08-22T10:00:00.000Z'), actorId: 'staff-1', actorRole: 'SUPER_ADMIN', action: 'REPORT_RESOLVE', targetType: 'Report', targetId: 'report-1', ip: '127.0.0.1', metadata: { reportId: 'report-1', email: 'private@example.mg' } },
          { id: 'audit-1', createdAt: new Date('2026-08-22T09:00:00.000Z'), actorId: null, actorRole: null, action: 'SYSTEM_CHECK', targetType: 'Health', targetId: 'health', ip: null, metadata: null },
        ]
      },
    },
  } as unknown as PrismaService
  const result = await new AuditService(prisma).list({ actorId: 'staff-1', action: 'REPORT', targetType: 'Report', from: '2026-08-22T00:00:00.000Z', limit: 1 })
  assert.equal(result.items.length, 1)
  assert.equal(result.items[0]?.id, 'audit-2')
  assert.equal(result.hasMore, true)
  assert.equal(result.nextCursor, 'audit-2')
  assert.deepEqual(result.items[0]?.metadata, { reportId: 'report-1' })
  assert.deepEqual(receivedWhere, {
    actorId: 'staff-1',
    action: { contains: 'REPORT', mode: 'insensitive' },
    targetType: { equals: 'Report', mode: 'insensitive' },
    createdAt: { gte: new Date('2026-08-22T00:00:00.000Z') },
  })
})

test('S-05 rejette une période inversée avant toute lecture', async () => {
  let read = false
  const prisma = { auditLog: { findMany: async () => { read = true; return [] } } } as unknown as PrismaService
  await assert.rejects(() => new AuditService(prisma).list({ from: '2026-08-23', to: '2026-08-22' }))
  assert.equal(read, false)
})
