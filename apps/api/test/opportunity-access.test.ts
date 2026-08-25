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
