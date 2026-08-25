import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ForbiddenException } from '@nestjs/common'
import { OrganizationRole } from '@prisma/client'
import { OpportunityService } from '../src/organization-request/opportunity.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { AuditService } from '../src/audit/audit.service.js'

function createService(role: OrganizationRole, organizationId = 'org-a', capabilities: string[] = []) {
  const prisma = {
    organizationMember: {
      findUnique: async ({ where }: { where: { organizationId_userId: { organizationId: string } } }) => where.organizationId_userId.organizationId === organizationId ? ({
        role,
        user: { status: 'ACTIVE' },
        organization: { capabilities: capabilities.map((capability) => ({ capability })) },
      }) : null,
    },
    opportunity: {
      findMany: async ({ where }: { where: { organizationId: string } }) => {
        if (where.organizationId !== organizationId) throw new Error('unexpected organization query')
        return [{ id: 'opportunity-1', organizationId, status: 'PUBLISHED' }]
      },
    },
  } as unknown as PrismaService
  const audit = {} as AuditService
  return new OpportunityService(prisma, audit)
}

test('VIEW-002 — un ORG_VIEWER peut lire les opportunités de son organisation sans capacité de publication', async () => {
  const service = createService(OrganizationRole.ORG_VIEWER)
  const opportunities = await service.listForOrganization('user-viewer', 'org-a')

  assert.deepEqual(opportunities, [{ id: 'opportunity-1', organizationId: 'org-a', status: 'PUBLISHED' }])
})

test('VIEW-001 — un ORG_VIEWER ne peut pas lire les opportunités d’une autre organisation', async () => {
  const service = createService(OrganizationRole.ORG_VIEWER)

  await assert.rejects(
    service.listForOrganization('user-viewer', 'org-b'),
    (error: unknown) => error instanceof ForbiddenException,
  )
})

function createMutationService(role: OrganizationRole, capabilities: string[] = []) {
  const prisma = {
    organizationMember: {
      findUnique: async () => ({
        role,
        user: { status: 'ACTIVE' },
        organization: { capabilities: capabilities.map((capability) => ({ capability })) },
      }),
    },
    opportunity: {
      create: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'opportunity-1', ...data }),
      findFirst: async () => ({ id: 'opportunity-1', status: 'DRAFT' }),
      findUnique: async () => ({ id: 'opportunity-1', status: 'PUBLISHED' }),
      update: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'opportunity-1', organizationId: 'org-a', ...data }),
    },
    opportunityApplication: {
      findUnique: async () => ({ id: 'application-1', status: 'PENDING', opportunity: { organizationId: 'org-a' } }),
      update: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'application-1', opportunityId: 'opportunity-1', applicantType: 'TALENT', applicantId: 'talent-1', message: 'A valid application message', ...data }),
      findMany: async () => [],
    },
  } as unknown as PrismaService
  const audit = { record: async () => undefined } as unknown as AuditService
  return new OpportunityService(prisma, audit)
}

test('MGR-002 — un ORG_MANAGER avec capacité peut créer et publier une opportunité', async () => {
  const service = createMutationService(OrganizationRole.ORG_MANAGER, ['PUBLISH_OPPORTUNITY'])
  const created = await service.create('user-manager', 'org-a', { type: 'EVENT', title: 'Événement de recrutement', description: 'Une description suffisamment longue pour valider cette opportunité.' })
  const published = await service.publish('user-manager', 'org-a', 'opportunity-1')

  assert.equal(created.status, 'DRAFT')
  assert.equal(published.status, 'PUBLISHED')
})

test('MGR-004 et VIEW-004 — capacité absente ou rôle viewer refuse les mutations', async () => {
  const managerWithoutCapability = createMutationService(OrganizationRole.ORG_MANAGER)
  await assert.rejects(() => managerWithoutCapability.create('user-manager', 'org-a', { title: 'Titre valide', description: 'Une description suffisamment longue pour valider cette opportunité.' }), (error: unknown) => error instanceof ForbiddenException)

  const viewer = createMutationService(OrganizationRole.ORG_VIEWER, ['PUBLISH_OPPORTUNITY'])
  await assert.rejects(() => viewer.create('user-viewer', 'org-a', { title: 'Titre valide', description: 'Une description suffisamment longue pour valider cette opportunité.' }), (error: unknown) => error instanceof ForbiddenException)
  await assert.rejects(() => viewer.decideApplication('user-viewer', 'org-a', 'application-1', { status: 'ACCEPTED' }), (error: unknown) => error instanceof ForbiddenException)
})
