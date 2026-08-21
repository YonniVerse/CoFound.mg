import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AUDIT_ACTION_KEY } from '../src/audit/audit.decorator.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { InstitutionMembersController } from '../src/institution/institution-members.controller.js'
import { InstitutionMembersService } from '../src/institution/institution-members.service.js'
import { InstitutionOverviewController } from '../src/institution/institution-overview.controller.js'
import { InstitutionOverviewService } from '../src/institution/institution-overview.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

const route = 'path'

test('E-16 overview masque chaque agrégat inférieur à cinq', async () => {
  const prisma = {
    organizationMember: { findMany: async (options: { select?: unknown } = {}) => options.select ? [{ userId: 'u1' }] : [{ organizationId: 'org-1', role: 'ORG_VIEWER', organization: { id: 'org-1', name: 'Institut' } }] },
    organization: { findUniqueOrThrow: async () => ({ id: 'org-1', name: 'Institut' }) },
    affiliation: { count: async () => 4 },
    project: { count: async () => 4 },
    importBatch: { findMany: async () => [] },
  } as unknown as PrismaService
  const result = await new InstitutionOverviewService(prisma).getMine('u1')
  assert.deepEqual(result.organizations[0]!.metrics, { affiliates: null, activated: null, completedProfiles: null, projects: null })
})

test('E-16 membres refuse la rétrogradation du dernier administrateur', async () => {
  const prisma = {
    organizationMember: {
      findUnique: async () => ({ role: 'ORG_ADMIN' }),
      findFirst: async () => ({ id: 'm1', organizationId: 'org-1', role: 'ORG_ADMIN' }),
      count: async () => 1,
    },
  } as unknown as PrismaService
  const service = new InstitutionMembersService(prisma)
  await assert.rejects(() => service.update('org-1', 'm1', 'admin-1', { role: 'ORG_VIEWER' }), /dernier administrateur/)
})

test('E-16 contrôleurs exposent les permissions et audits attendus', () => {
  assert.equal(Reflect.getMetadata(route, InstitutionOverviewController.prototype.getOverview), 'overview')
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, InstitutionOverviewController.prototype.getOverview), ['org:read'])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, InstitutionMembersController.prototype.list), ['org:read'])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, InstitutionMembersController.prototype.invite), ['org:manage'])
  assert.deepEqual(Reflect.getMetadata(AUDIT_ACTION_KEY, InstitutionMembersController.prototype.invite), { action: 'ORGANIZATION_MEMBER_INVITE', targetType: 'OrganizationMember' })
  assert.deepEqual(Reflect.getMetadata(AUDIT_ACTION_KEY, InstitutionMembersController.prototype.update), { action: 'ORGANIZATION_MEMBER_ROLE_UPDATE', targetType: 'OrganizationMember' })
  assert.deepEqual(Reflect.getMetadata(AUDIT_ACTION_KEY, InstitutionMembersController.prototype.remove), { action: 'ORGANIZATION_MEMBER_REMOVE', targetType: 'OrganizationMember' })
})
