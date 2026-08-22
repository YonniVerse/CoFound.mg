import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BadRequestException, ConflictException } from '@nestjs/common'
import { OrganizationRequestStaffService } from '../src/organization-request/organization-request-staff.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { AuditService } from '../src/audit/audit.service.js'

const request = {
  id: 'request-1', organizationType: 'INSTITUTION', organizationName: 'Université Test', countryCode: 'MG', region: 'Analamanga',
  website: null, description: 'Une description suffisamment longue pour le test.', sectorsOfInterest: ['Éducation'], contactName: 'Miora Test',
  contactRole: 'Directrice', contactEmail: 'miora@test.mg', contactPhone: null, supportingDocuments: [], status: 'PENDING',
  decisionReason: null, decidedAt: null, createdAt: new Date('2026-08-22T10:00:00.000Z'), approvedOrganizationId: null,
}

function auditMock(): AuditService & { events: unknown[] } {
  const events: unknown[] = []
  return { events, record: async (event: unknown) => { events.push(event) } } as unknown as AuditService & { events: unknown[] }
}

test('B-02 liste les demandes par ancienneté et retourne un curseur', async () => {
  const prisma = {
    organizationRequest: {
      findMany: async () => [request, { ...request, id: 'request-2', createdAt: new Date('2026-08-23T10:00:00.000Z') }],
    },
  } as unknown as PrismaService
  const result = await new OrganizationRequestStaffService(prisma, auditMock()).list({ status: 'PENDING', limit: 1 })
  assert.equal(result.items.length, 1)
  assert.equal(result.items[0]?.id, 'request-1')
  assert.equal(result.nextCursor, 'request-1')
  assert.equal(result.hasMore, true)
})

test('B-02 approuve une demande, crée l’organisation et son premier admin dans une transaction', async () => {
  let transactionCalled = false
  const audit = auditMock()
  const prisma = {
    $transaction: async (callback: (transaction: Record<string, unknown>) => Promise<unknown>) => {
      transactionCalled = true
      return callback({
        organizationRequest: {
          findUnique: async () => request,
          update: async () => ({ id: request.id, status: 'APPROVED', approvedOrganizationId: 'org-1', decidedAt: new Date() }),
        },
        organization: { create: async () => ({ id: 'org-1', name: request.organizationName, type: request.organizationType, verificationStatus: 'VERIFIED' }) },
        user: { findUnique: async () => null, create: async () => ({ id: 'user-1', email: request.contactEmail, status: 'INVITED' }) },
        organizationMember: { create: async () => ({ id: 'member-1' }) },
      })
    },
  } as unknown as PrismaService

  const result = await new OrganizationRequestStaffService(prisma, audit).approve('staff-1', request.id)
  assert.equal(transactionCalled, true)
  assert.equal(result.organization.id, 'org-1')
  assert.equal(result.user.email, request.contactEmail)
  assert.equal(audit.events.length, 1)
})

test('B-02 refuse une demande sans motif et empêche une décision répétée', async () => {
  const prisma = { organizationRequest: { findUnique: async () => request } } as unknown as PrismaService
  const service = new OrganizationRequestStaffService(prisma, auditMock())
  await assert.rejects(() => service.reject('staff-1', request.id, {}), (error: unknown) => error instanceof BadRequestException)
  const decidedPrisma = { organizationRequest: { findUnique: async () => ({ ...request, status: 'APPROVED' }) } } as unknown as PrismaService
  await assert.rejects(() => new OrganizationRequestStaffService(decidedPrisma, auditMock()).reject('staff-1', request.id, { reason: 'Déjà traité' }), (error: unknown) => error instanceof ConflictException)
})

test('B-02 interdit CERTIFY_AFFILIATION hors établissement', async () => {
  const prisma = { organization: { findUnique: async () => ({ id: 'org-1', type: 'COMPANY' }) } } as unknown as PrismaService
  await assert.rejects(
    () => new OrganizationRequestStaffService(prisma, auditMock()).grantCapability('staff-1', 'org-1', { capability: 'CERTIFY_AFFILIATION' }),
    (error: unknown) => error instanceof BadRequestException,
  )
})

test('B-02 accorde une capacité MVP et audite l’octroi', async () => {
  const audit = auditMock()
  const prisma = {
    organization: { findUnique: async () => ({ id: 'org-1', type: 'INSTITUTION' }) },
    organizationCapability: {
      upsert: async () => ({ id: 'cap-1', organizationId: 'org-1', capability: 'CERTIFY_AFFILIATION', grantedById: 'staff-1', grantedAt: new Date() }),
    },
  } as unknown as PrismaService
  const result = await new OrganizationRequestStaffService(prisma, audit).grantCapability('staff-1', 'org-1', { capability: 'CERTIFY_AFFILIATION' })
  assert.equal(result.id, 'cap-1')
  assert.equal(audit.events.length, 1)
})
