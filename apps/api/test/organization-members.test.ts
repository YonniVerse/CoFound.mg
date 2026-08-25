import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ForbiddenException } from '@nestjs/common'
import { OrganizationRole } from '@prisma/client'
import { InstitutionMembersService } from '../src/institution/institution-members.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

function createPrisma(actorRole: OrganizationRole = OrganizationRole.ORG_MANAGER) {
  const actor = { id: 'member-manager', organizationId: 'org-a', userId: 'user-manager', role: actorRole }
  const target = { id: 'member-target', organizationId: 'org-a', userId: 'user-target', role: OrganizationRole.ORG_VIEWER }
  const prisma = {
    organizationMember: {
      findUnique: async () => actor,
      findFirst: async () => target,
      update: async () => ({ ...target, role: OrganizationRole.ORG_ADMIN, user: { id: target.userId, email: 'target@example.com', status: 'ACTIVE' }, createdAt: new Date() }),
      count: async () => 2,
    },
  } as unknown as PrismaService
  return prisma
}

test('MGR-006 — un ORG_MANAGER ne peut pas promouvoir un membre en ORG_ADMIN', async () => {
  const service = new InstitutionMembersService(createPrisma())

  await assert.rejects(
    service.update('org-a', 'member-target', 'user-manager', { role: OrganizationRole.ORG_ADMIN }),
    (error: unknown) => error instanceof ForbiddenException,
  )
})

test('VIEW-003 — un ORG_VIEWER ne peut pas modifier un membre', async () => {
  const service = new InstitutionMembersService(createPrisma(OrganizationRole.ORG_VIEWER))

  await assert.rejects(
    service.update('org-a', 'member-target', 'user-viewer', { role: OrganizationRole.ORG_MANAGER }),
    (error: unknown) => error instanceof ForbiddenException,
  )
})
