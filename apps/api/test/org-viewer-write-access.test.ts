import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ForbiddenException } from '@nestjs/common'
import { ImportApplyService } from '../src/import/import-apply.service.js'
import { InstitutionAffiliationService } from '../src/institution/institution-affiliation.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { NotificationsQueueService } from '../src/notifications/notifications-queue.service.js'

test('VIEW-005 — un ORG_VIEWER ne peut pas appliquer un import', async () => {
  const transaction = {
    importBatch: {
      findUnique: async () => ({ id: 'batch-1', organizationId: 'org-a', status: 'PREVIEW', rows: [] }),
    },
    organizationMember: {
      findUnique: async () => ({ role: 'ORG_VIEWER' }),
    },
  }
  const prisma = { $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction) } as unknown as PrismaService
  const queue = {} as NotificationsQueueService

  await assert.rejects(
    new ImportApplyService(prisma, queue).apply({ batchId: 'batch-1' }, 'viewer-1'),
    (error: unknown) => error instanceof ForbiddenException,
  )
})

test('VIEW-005 — un ORG_VIEWER ne peut pas modifier une affiliation', async () => {
  const prisma = {
    affiliation: {
      findUnique: async () => ({ id: 'affiliation-1', organizationId: 'org-a' }),
      findMany: async () => [{ id: 'affiliation-1', organizationId: 'org-a' }],
    },
    organizationMember: {
      findUnique: async () => ({ role: 'ORG_VIEWER' }),
    },
  } as unknown as PrismaService
  const service = new InstitutionAffiliationService(prisma)

  await assert.rejects(
    service.update('affiliation-1', 'viewer-1', 'SUSPENDED'),
    (error: unknown) => error instanceof ForbiddenException,
  )
  await assert.rejects(
    service.bulkStatus('viewer-1', ['affiliation-1'], 'SUSPENDED', 'MODIFIER 1'),
    (error: unknown) => error instanceof ForbiddenException,
  )
})
