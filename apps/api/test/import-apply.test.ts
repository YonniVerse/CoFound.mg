/* eslint-disable @typescript-eslint/no-explicit-any -- mocks Prisma volontairement structurés pour les tests de transaction */
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { AUDIT_ACTION_KEY } from '../src/audit/audit.decorator.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { ImportApplyController } from '../src/import/import-apply.controller.js'
import { ImportApplyService } from '../src/import/import-apply.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { NotificationsQueueService } from '../src/notifications/notifications-queue.service.js'

const ROUTE_PATH_METADATA = 'path'

type FakeState = {
  batch: any
  users: Map<string, any>
  rowUpdates: any[]
  batchUpdates: any[]
  invitations: any[]
  jobs: any[]
}

function fakeDependencies(batch: any, existingUsers: any[] = []) {
  const state: FakeState = {
    batch: {
      ...batch,
      organization: { type: 'INSTITUTION' },
    },
    users: new Map(existingUsers.map((user) => [user.email, user])),
    rowUpdates: [],
    batchUpdates: [],
    invitations: [],
    jobs: [],
  }

  // Pre-seed manager user
  state.users.set('manager-1', { id: 'manager-1', email: 'manager@example.mg', platformRole: 'ORG_MEMBER' })

  const transaction = {
    importBatch: {
      findUnique: async () => state.batch,
      update: async ({ data }: any) => {
        state.batchUpdates.push(data)
        return { ...state.batch, ...data }
      },
    },
    organizationMember: {
      findUnique: async () => ({ role: 'ORG_MANAGER' }),
    },
    user: {
      findUnique: async ({ where }: any) => {
        if (where.email) return state.users.get(where.email) ?? null
        if (where.id) return state.users.get(where.id) ?? { id: where.id, platformRole: 'ORG_MEMBER' }
        return null
      },
      create: async ({ data }: any) => {
        const user = { id: `user-${state.users.size + 1}`, ...data }
        state.users.set(user.email, user)
        return user
      },
      update: async ({ where, data }: any) => {
        const current = [...state.users.values()].find((user) => user.id === where.id)
        if (!current) throw new Error('user not found')
        Object.assign(current, data)
        return current
      },
    },
    talentIdentity: { upsert: async () => ({}) },
    talentProfile: { upsert: async () => ({}) },
    affiliation: { upsert: async () => ({}) },
    field: { findMany: async () => [] },
    importRow: {
      update: async ({ data }: any) => {
        state.rowUpdates.push(data)
        return data
      },
    },
    invitationToken: {
      create: async ({ data }: any) => {
        state.invitations.push(data)
        return data
      },
    },
  }

  const prisma = {
    $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction),
  } as unknown as PrismaService
  const queue = {
    enqueue: async (job: unknown) => {
      state.jobs.push(job)
      return `job-${state.jobs.length}`
    },
  } as unknown as NotificationsQueueService

  return { state, prisma, queue }
}

function validBatch() {
  return {
    id: 'batch-1',
    organizationId: 'org-1',
    uploadedById: 'uploader-1',
    status: 'PREVIEW',
    totalRows: 2,
    createdRows: 0,
    updatedRows: 0,
    errorRows: 0,
    columnMapping: {
      email: 'Adresse e-mail',
      firstName: 'Prénom',
      lastName: 'Nom',
      fieldOfStudy: 'Filière',
      level: 'Niveau',
      entryYear: 'Année',
    },
    rows: [
      {
        id: 'row-1',
        lineNumber: 2,
        result: null,
        raw: { 'Adresse e-mail': 'new@example.mg', 'Prénom': 'Noro', 'Nom': 'Rabe', 'Filière': 'Informatique', 'Niveau': 'L3', 'Année': 2024 },
      },
      {
        id: 'row-2',
        lineNumber: 3,
        result: null,
        raw: { 'Adresse e-mail': 'existing@example.mg', 'Prénom': 'Fara', 'Nom': 'Rakoto', 'Filière': 'Gestion', 'Niveau': 'M1', 'Année': 2023 },
      },
    ],
  }
}

test('E-07 applique un lot dans une transaction et publie une invitation pour chaque nouvel utilisateur', async () => {
  const existing = { id: 'existing-user', email: 'existing@example.mg', status: 'INVITED', platformRole: 'TALENT', locale: 'fr' }
  const dependencies = fakeDependencies(validBatch(), [existing])
  const service = new ImportApplyService(dependencies.prisma, dependencies.queue)

  const result = await service.apply({ batchId: 'batch-1' }, 'manager-1')

  assert.deepEqual(result, {
    batchId: 'batch-1',
    status: 'APPLIED',
    totalRows: 2,
    createdRows: 1,
    updatedRows: 1,
    skippedRows: 0,
    errorRows: 0,
  })
  assert.equal(dependencies.state.invitations.length, 1)
  assert.equal(dependencies.state.jobs.length, 1)
  assert.equal(dependencies.state.rowUpdates[0].result, 'CREATED')
  assert.equal(dependencies.state.rowUpdates[1].result, 'UPDATED')
  assert.equal(dependencies.state.batchUpdates[0].status, 'APPLIED')
})

test('E-07 est idempotent : un lot déjà appliqué est retourné sans réécriture ni nouvelle invitation', async () => {
  const batch = { ...validBatch(), status: 'APPLIED', totalRows: 2, createdRows: 1, updatedRows: 1, errorRows: 0, rows: validBatch().rows.map((row: any) => ({ ...row, result: 'CREATED' })) }
  const dependencies = fakeDependencies(batch)
  const service = new ImportApplyService(dependencies.prisma, dependencies.queue)

  const result = await service.apply({ batchId: 'batch-1' }, 'manager-1')

  assert.equal(result.status, 'APPLIED')
  assert.equal(result.createdRows, 1)
  assert.equal(dependencies.state.rowUpdates.length, 0)
  assert.equal(dependencies.state.invitations.length, 0)
  assert.equal(dependencies.state.jobs.length, 0)
})

test('E-07 ne publie rien si la transaction échoue', async () => {
  const dependencies = fakeDependencies(validBatch())
  const transaction = dependencies.prisma as any
  transaction.$transaction = async () => { throw new Error('rollback') }
  const service = new ImportApplyService(transaction, dependencies.queue)

  await assert.rejects(() => service.apply({ batchId: 'batch-1' }, 'manager-1'), /rollback/)
  assert.equal(dependencies.state.jobs.length, 0)
})

test('E-07 expose une route protégée et auditée avec les métadonnées attendues', () => {
  const prototype = ImportApplyController.prototype
  const handler = prototype.apply

  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ImportApplyController), ['org:read'])
  assert.equal(Reflect.getMetadata(ROUTE_PATH_METADATA, handler), ':id/apply')
  assert.deepEqual(Reflect.getMetadata(AUDIT_ACTION_KEY, handler), { action: 'IMPORT_APPLY', targetType: 'ImportBatch' })
})

test('E-07 contrôle le lot depuis l’identifiant de route du contrôleur', async () => {
  const calls: any[] = []
  const service = { apply: async (input: unknown, actorId: string) => { calls.push({ input, actorId }); return { status: 'APPLIED' } } }
  const controller = new ImportApplyController(service as unknown as ImportApplyService)

  await controller.apply('batch-route', {}, { user: { userId: 'manager-1', platformRole: 'ORG_MEMBER', status: 'ACTIVE' } } as any)

  assert.deepEqual(calls, [{ input: { batchId: 'batch-route' }, actorId: 'manager-1' }])
})
