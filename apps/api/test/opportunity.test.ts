import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { OpportunityService } from '../src/organization-request/opportunity.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { AuditService } from '../src/audit/audit.service.js'

function auditMock(): AuditService {
  return { record: async () => undefined } as unknown as AuditService
}

const capabilityMember = { user: { status: 'ACTIVE' }, role: 'ORG_ADMIN', organization: { capabilities: [{ capability: 'PUBLISH_OPPORTUNITY' }] } }

test('B-06 refuse la création sans capacité de publication', async () => {
  const prisma = { organizationMember: { findUnique: async () => ({ ...capabilityMember, organization: { capabilities: [] } }) } } as unknown as PrismaService
  await assert.rejects(() => new OpportunityService(prisma, auditMock()).create('u1', 'org1', { title: 'Appel', description: 'Une description suffisamment longue pour être valide.' }), (error: unknown) => error instanceof ForbiddenException)
})

test('B-06 crée une opportunité en brouillon puis la publie', async () => {
  let published = false
  const prisma = {
    organizationMember: { findUnique: async () => capabilityMember },
    opportunity: {
      create: async () => ({ id: 'opp1', organizationId: 'org1', type: 'CALL_FOR_APPLICATIONS', title: 'Appel', description: 'Une description suffisamment longue pour être valide.', eligibility: null, deadline: null, seats: null, status: 'DRAFT', createdAt: new Date(), updatedAt: new Date() }),
      findFirst: async () => ({ id: 'opp1', status: 'DRAFT' }),
      update: async () => { published = true; return { id: 'opp1', organizationId: 'org1', type: 'CALL_FOR_APPLICATIONS', title: 'Appel', description: 'Une description suffisamment longue pour être valide.', eligibility: null, deadline: null, seats: null, status: 'PUBLISHED', createdAt: new Date(), updatedAt: new Date() } },
    },
  } as unknown as PrismaService
  const service = new OpportunityService(prisma, auditMock())
  const draft = await service.create('u1', 'org1', { title: 'Appel', description: 'Une description suffisamment longue pour être valide.' })
  assert.equal(draft.status, 'DRAFT')
  await service.publish('u1', 'org1', 'opp1')
  assert.equal(published, true)
})

test('B-07 accepte une candidature talent uniquement pour le compte courant', async () => {
  const prisma = { opportunity: { findUnique: async () => ({ id: 'opp1', status: 'PUBLISHED' }) } } as unknown as PrismaService
  await assert.rejects(() => new OpportunityService(prisma, auditMock()).apply('u1', 'opp1', { applicantType: 'TALENT', applicantId: 'other', message: 'Je souhaite rejoindre ce programme.' }), (error: unknown) => error instanceof ForbiddenException)
})

test('B-08 exige un motif lorsqu’un partenaire rejette une candidature', async () => {
  const prisma = { organizationMember: { findUnique: async () => capabilityMember } } as unknown as PrismaService
  await assert.rejects(() => new OpportunityService(prisma, auditMock()).decideApplication('u1', 'org1', 'app1', { status: 'REJECTED' }), (error: unknown) => error instanceof BadRequestException)
})

test('B-08 empêche une décision répétée', async () => {
  const prisma = {
    organizationMember: { findUnique: async () => capabilityMember },
    opportunityApplication: { findUnique: async () => ({ id: 'app1', status: 'ACCEPTED', opportunity: { organizationId: 'org1' } }) },
  } as unknown as PrismaService
  await assert.rejects(() => new OpportunityService(prisma, auditMock()).decideApplication('u1', 'org1', 'app1', { status: 'REJECTED', rejectionReason: 'Déjà traité' }), (error: unknown) => error instanceof ConflictException)
})
