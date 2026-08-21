import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AUDIT_ACTION_KEY } from '../src/audit/audit.decorator.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { InstitutionAffiliationController } from '../src/institution/institution-affiliation.controller.js'
import { InstitutionAffiliationService } from '../src/institution/institution-affiliation.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

test('E-18 refuse une opération groupée qui mélange plusieurs organisations', async () => {
  const prisma = { affiliation: { findMany: async () => [{ id: 'a1', organizationId: 'org-1' }, { id: 'a2', organizationId: 'org-2' }] }, organizationMember: { findUnique: async () => ({ role: 'ORG_MANAGER' }) } } as unknown as PrismaService
  await assert.rejects(() => new InstitutionAffiliationService(prisma).bulkStatus('actor', ['a1', 'a2'], 'LEAVING', 'MODIFIER 2'), /pas accessibles/)
})

test('E-18 exige une confirmation exacte pour le changement groupé', async () => {
  const prisma = { affiliation: { findMany: async () => [] } } as unknown as PrismaService
  await assert.rejects(() => new InstitutionAffiliationService(prisma).bulkStatus('actor', ['a1'], 'LEAVING', 'MODIFIER 2'), /MODIFIER 1/)
})

test('E-18 applique le changement groupé dans une transaction', async () => {
  const calls: unknown[] = []
  const tx = { affiliation: { updateMany: async (args: unknown) => { calls.push(args); return { count: 2 } } } }
  const prisma = { affiliation: { findMany: async () => [{ id: 'a1', organizationId: 'org-1' }, { id: 'a2', organizationId: 'org-1' }] }, organizationMember: { findUnique: async () => ({ role: 'ORG_MANAGER' }) }, $transaction: async (callback: (value: typeof tx) => Promise<unknown>) => callback(tx) } as unknown as PrismaService
  assert.deepEqual(await new InstitutionAffiliationService(prisma).bulkStatus('actor', ['a1', 'a2'], 'LEAVING', 'MODIFIER 2'), { updated: 2, status: 'LEAVING' })
  assert.equal(calls.length, 1)
})

test('E-18 protège les routes et audite les mutations', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, InstitutionAffiliationController.prototype.list), ['org:manage'])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, InstitutionAffiliationController.prototype.bulk), ['org:manage'])
  assert.deepEqual(Reflect.getMetadata(AUDIT_ACTION_KEY, InstitutionAffiliationController.prototype.update), { action: 'AFFILIATION_STATUS_UPDATE', targetType: 'Affiliation' })
  assert.deepEqual(Reflect.getMetadata(AUDIT_ACTION_KEY, InstitutionAffiliationController.prototype.bulk), { action: 'AFFILIATION_BULK_STATUS', targetType: 'Affiliation' })
})
