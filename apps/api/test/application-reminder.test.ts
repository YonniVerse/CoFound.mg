import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ApplicationReminderService } from '../src/applications/application-reminder.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

type PendingApplication = {
  projectId: string
  createdAt: Date
  project: { createdById: string; title: string }
}

type NotificationRecord = {
  userId: string
  type: string
  payload: unknown
  createdAt: Date
}

function mockPrisma(
  pending: PendingApplication[],
  notifications: NotificationRecord[] = [],
) {
  const created: NotificationRecord[] = []
  const prisma = {
    application: {
      findMany: async (args: { where?: { createdAt?: { lte?: Date } } }) => {
        const limit = args.where?.createdAt?.lte
        return limit ? pending.filter((application) => application.createdAt <= limit) : pending
      },
    },
    notification: {
      findMany: async () => notifications,
      create: async ({ data }: { data: { userId: string; type: string; payload: unknown } }) => {
        const record = { ...data, createdAt: new Date() }
        created.push(record)
        return record
      },
    },
  }
  return { prisma: prisma as unknown as PrismaService, created }
}

test('P-07: relance uniquement les candidatures PENDING au-delà du seuil', async () => {
  const now = new Date('2026-08-21T12:00:00.000Z')
  const old = new Date('2026-08-17T11:00:00.000Z')
  const recent = new Date('2026-08-20T11:00:00.000Z')
  const { prisma, created } = mockPrisma([
    { projectId: 'project-1', createdAt: old, project: { createdById: 'owner-1', title: 'EcoDrive' } },
    { projectId: 'project-2', createdAt: recent, project: { createdById: 'owner-2', title: 'SafeWalk' } },
  ])
  const previous = process.env.APPLICATION_REMINDER_DAYS
  process.env.APPLICATION_REMINDER_DAYS = '3'
  try {
    const result = await new ApplicationReminderService(prisma).runOnce(now)
    assert.deepEqual(result, { created: 1, skipped: 0 })
    assert.equal(created[0]?.userId, 'owner-1')
  } finally {
    if (previous === undefined) delete process.env.APPLICATION_REMINDER_DAYS
    else process.env.APPLICATION_REMINDER_DAYS = previous
  }
})

test('P-07: regroupe plusieurs candidatures du même projet dans une relance', async () => {
  const now = new Date('2026-08-21T12:00:00.000Z')
  const old = new Date('2026-08-17T11:00:00.000Z')
  const { prisma, created } = mockPrisma([
    { projectId: 'project-1', createdAt: old, project: { createdById: 'owner-1', title: 'EcoDrive' } },
    { projectId: 'project-1', createdAt: old, project: { createdById: 'owner-1', title: 'EcoDrive' } },
  ])
  const result = await new ApplicationReminderService(prisma).runOnce(now)
  assert.deepEqual(result, { created: 1, skipped: 0 })
  assert.equal((created[0]?.payload as { pendingCount: number }).pendingCount, 2)
})

test('P-07: ne crée pas une seconde relance pour le même porteur et projet', async () => {
  const now = new Date('2026-08-21T12:00:00.000Z')
  const old = new Date('2026-08-17T11:00:00.000Z')
  const { prisma, created } = mockPrisma(
    [{ projectId: 'project-1', createdAt: old, project: { createdById: 'owner-1', title: 'EcoDrive' } }],
    [{
      userId: 'owner-1',
      type: 'APPLICATION_REMINDER',
      payload: { projectId: 'project-1' },
      createdAt: new Date(),
    }],
  )
  const result = await new ApplicationReminderService(prisma).runOnce(now)
  assert.deepEqual(result, { created: 0, skipped: 1 })
  assert.equal(created.length, 0)
})
