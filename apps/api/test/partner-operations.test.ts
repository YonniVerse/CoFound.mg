import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ConflictException } from '@nestjs/common'
import { PartnerContactService } from '../src/organization-request/partner-contact.service.js'
import { FinancialEngagementService } from '../src/financial/financial-engagement.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { AuditService } from '../src/audit/audit.service.js'

const audit = { record: async () => undefined } as unknown as AuditService
const recruiter = { role: 'ORG_ADMIN', user: { status: 'ACTIVE' }, organization: { capabilities: [{ capability: 'RECRUIT' }] } }

test('B-09 empêche une seconde prise de contact vers le même projet', async () => {
  const prisma = {
    organizationMember: { findUnique: async () => recruiter },
    project: { findFirst: async () => ({ id: 'project-1' }) },
    organizationProjectContact: { findUnique: async () => ({ id: 'contact-existing' }) },
  } as unknown as PrismaService
  await assert.rejects(() => new PartnerContactService(prisma, audit).contact('user-1', 'org-1', 'project-1', { message: 'Nous souhaitons échanger avec votre équipe.' }), (error: unknown) => error instanceof ConflictException)
})

test('B-11 crée un engagement proposé avec une référence hors plateforme', async () => {
  const prisma = {
    organizationMember: { findUnique: async () => ({ role: 'ORG_ADMIN', user: { status: 'ACTIVE' } }) },
    project: { findUnique: async () => ({ id: 'project-1' }) },
    financialEngagement: { create: async () => ({ id: 'engagement-1', projectId: 'project-1', organizationId: 'org-1', type: 'GRANT', amount: { toString: () => '5000.00' }, currency: 'MGA', provider: 'OFF_PLATFORM', externalRef: 'OFF-ref', status: 'PROPOSED', createdAt: new Date() }) },
  } as unknown as PrismaService
  const result = await new FinancialEngagementService(prisma, audit).create('user-1', 'org-1', { projectId: 'project-1', type: 'GRANT', amount: '5000.00', currency: 'MGA' })
  assert.equal(result.status, 'PROPOSED')
  assert.equal(result.externalRef, 'OFF-ref')
})
