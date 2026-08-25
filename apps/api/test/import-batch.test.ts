import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { AUDIT_ACTION_KEY } from '../src/audit/audit.decorator.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { ImportBatchController } from '../src/import/import-batch.controller.js'
import { ImportBatchService } from '../src/import/import-batch.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { NotificationsQueueService } from '../src/notifications/notifications-queue.service.js'

const ROUTE_PATH_METADATA = 'path'
type TestRecord = Record<string, unknown>
type TestRow = { lineNumber: number; result: string; user?: { id: string; email: string; status: string; locale: string } }
type TestBatch = { id: string; organizationId: string; status: string; fileKey: string; uploadedById: string; createdAt: Date }

type TestState = {
  batch: TestBatch
  rows: TestRow[]
  updates: TestRecord[]
  invitations: TestRecord[]
  jobs: unknown[]
}

function dependencies(batch: TestBatch, rows: TestRow[] = []) {
  const state: TestState = { batch, rows, updates: [], invitations: [], jobs: [] }
  const tx = {
    importBatch: {
      findUnique: async (options: { include?: { rows?: { where?: { result?: string } } } } = {}) => ({
        ...state.batch,
        rows: options.include?.rows?.where?.result ? state.rows.filter((row) => row.result === options.include?.rows?.where?.result) : state.rows,
      }),
      update: async ({ data }: { data: TestRecord }) => { state.updates.push(data); return { ...state.batch, ...data } },
    },
    organizationMember: {
      findUnique: async () => ({ role: 'ORG_MANAGER' }),
      findMany: async () => [{ organizationId: 'org-1' }],
    },
    invitationToken: {
      create: async ({ data }: { data: TestRecord }) => { state.invitations.push(data); return data },
    },
  }
  const prisma = {
    importBatch: {
      findUnique: async () => state.batch,
      findMany: async () => [{ ...state.batch, uploadedBy: { id: 'uploader', email: 'uploader@example.mg' }, rows: state.rows.map((row) => ({ result: row.result })) }],
      update: async ({ data }: { data: TestRecord }) => { state.updates.push(data); return { ...state.batch, ...data } },
    },
    organizationMember: tx.organizationMember,
    invitationToken: tx.invitationToken,
    $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
  } as unknown as PrismaService
  const queue = {
    enqueue: async (job: unknown) => { state.jobs.push(job); return `job-${state.jobs.length}` },
  } as unknown as NotificationsQueueService
  return { state, prisma, queue }
}

function appliedBatch(): TestBatch {
  return { id: 'batch-1', organizationId: 'org-1', status: 'APPLIED', fileKey: 'imports/students.xlsx', uploadedById: 'uploader-1', createdAt: new Date('2026-08-21T00:00:00Z') }
}

test('E-08 annule un lot PREVIEW avec confirmation et reste idempotent', async () => {
  const preview = { ...appliedBatch(), status: 'PREVIEW' }
  const deps = dependencies(preview)
  const service = new ImportBatchService(deps.prisma, deps.queue)

  const result = await service.cancel('batch-1', 'manager-1', 'ANNULER batch-1')
  assert.deepEqual(result, { batchId: 'batch-1', status: 'CANCELLED', changed: true })
  assert.deepEqual(deps.state.updates, [{ status: 'CANCELLED' }])
})

test('E-08 refuse l’annulation sans confirmation ou après application', async () => {
  const deps = dependencies(appliedBatch())
  const service = new ImportBatchService(deps.prisma, deps.queue)

  await assert.rejects(() => service.cancel('batch-1', 'manager-1', ''), /ANNULER batch-1/)
  await assert.rejects(() => service.cancel('batch-1', 'manager-1', 'ANNULER batch-1'), /Seul un lot en prévisualisation/)
  assert.equal(deps.state.updates.length, 0)
})

test('E-08 relance uniquement les utilisateurs INVITED et publie un job par invitation', async () => {
  const rows: TestRow[] = [
    { lineNumber: 2, result: 'CREATED', user: { id: 'u1', email: 'invite@example.mg', status: 'INVITED', locale: 'fr' } },
    { lineNumber: 3, result: 'CREATED', user: { id: 'u2', email: 'active@example.mg', status: 'ACTIVE', locale: 'mg' } },
    { lineNumber: 4, result: 'UPDATED', user: { id: 'u3', email: 'updated@example.mg', status: 'INVITED', locale: 'fr' } },
  ]
  const deps = dependencies(appliedBatch(), rows)
  const service = new ImportBatchService(deps.prisma, deps.queue)

  const result = await service.resendInvitations('batch-1', 'manager-1')
  const invitation = deps.state.invitations[0]
  const job = deps.state.jobs[0] as TestRecord

  assert.deepEqual(result, { batchId: 'batch-1', eligible: 1, queued: 1 })
  assert.ok(invitation)
  assert.equal(deps.state.invitations.length, 1)
  assert.equal(invitation.userId, 'u1')
  assert.equal(deps.state.jobs.length, 1)
  assert.equal(job.kind, 'account.activation')
})

test('E-08 expose les routes, permissions et audits attendus', () => {
  const prototype = ImportBatchController.prototype
  assert.equal(Reflect.getMetadata(ROUTE_PATH_METADATA, prototype.list), '/')
  assert.equal(Reflect.getMetadata(ROUTE_PATH_METADATA, prototype.detail), ':id')
  assert.equal(Reflect.getMetadata(ROUTE_PATH_METADATA, prototype.cancel), ':id/cancel')
  assert.equal(Reflect.getMetadata(ROUTE_PATH_METADATA, prototype.resendInvitations), ':id/resend-invitations')
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, prototype.list), ['org:read'])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, prototype.cancel), ['org:read'])
  assert.deepEqual(Reflect.getMetadata(AUDIT_ACTION_KEY, prototype.cancel), { action: 'IMPORT_CANCEL', targetType: 'ImportBatch' })
  assert.deepEqual(Reflect.getMetadata(AUDIT_ACTION_KEY, prototype.resendInvitations), { action: 'IMPORT_RESEND_INVITATIONS', targetType: 'ImportBatch' })
})
