import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BMC_BLOCK_KEYS } from '@cofound/shared'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { BmcController } from '../src/project/bmc.controller.js'
import { BmcService } from '../src/project/bmc.service.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { Permission } from '../src/rbac/permissions.js'

const member = { id: 'm1', role: 'OWNER' }
const empty = Object.fromEntries(BMC_BLOCK_KEYS.map((key) => [key, { content: '', isPublic: false }]))

test('P-02 calcule la complétion à partir des blocs enregistrés', async () => {
  const prisma = { project: { findUnique: async () => ({ id: 'p1', members: [member] }) }, businessModelCanvas: { findUnique: async () => ({ projectId: 'p1', blocks: { ...empty, customerSegments: { content: 'Coopératives', isPublic: true } }, completion: 99, updatedAt: new Date(), updatedById: 'u1' }) } } as unknown as PrismaService
  const response = await new BmcService(prisma).get('u1', 'p1')
  assert.equal(response.completedBlocks, 1)
  assert.equal(response.completion, 11)
  assert.equal(response.blocks.customerSegments.isPublic, true)
})

test('P-02 met à jour un bloc dans une transaction et recalcule la complétion', async () => {
  let transactionCalled = false
  let updateData: { create: { blocks: Record<string, { content: string; isPublic: boolean }> } } | undefined
  const prisma = {
    project: { findUnique: async () => ({ id: 'p1', members: [member] }) },
    businessModelCanvas: { findUnique: async () => null },
    $transaction: async (callback: (tx: { businessModelCanvas: { findUnique: () => Promise<null>; upsert: (args: { create: { blocks: Record<string, { content: string; isPublic: boolean }> } }) => Promise<unknown> } }) => Promise<unknown>) => { transactionCalled = true; return callback({ businessModelCanvas: { findUnique: async () => null, upsert: async (args) => { updateData = args; return { projectId: 'p1', blocks: args.create.blocks, completion: 11, updatedAt: new Date(), updatedById: 'u1' } } } }) },
  } as unknown as PrismaService
  const response = await new BmcService(prisma).patch('u1', 'p1', { block: 'valuePropositions', value: { content: 'Stockage partagé', isPublic: false } })
  assert.equal(transactionCalled, true)
  assert.equal(response.completion, 11)
  assert.equal(updateData?.create.blocks.valuePropositions?.content, 'Stockage partagé')
})

test('P-02 refuse le BMC aux utilisateurs qui ne sont pas membres', async () => {
  const prisma = { project: { findUnique: async () => ({ id: 'p1', members: [] }) } } as unknown as PrismaService
  await assert.rejects(() => new BmcService(prisma).get('u2', 'p1'), /Accès au BMC refusé/)
})

test('P-02 protège la lecture et la mise à jour avec les permissions projet', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, BmcController.prototype.get), [Permission.PROJECT_READ])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, BmcController.prototype.patch), [Permission.PROJECT_MANAGE])
})
