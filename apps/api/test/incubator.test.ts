import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ConflictException, ForbiddenException } from '@nestjs/common'
import { IncubatorService } from '../src/organization-request/incubator.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { AuditService } from '../src/audit/audit.service.js'

function createService(overrides: Record<string, unknown> = {}) {
  const prisma = {
    organizationMember: { findUnique: async () => ({ role: 'ORG_ADMIN', user: { status: 'ACTIVE' }, organization: { type: 'INCUBATOR' } }) },
    organization: { findUnique: async () => ({ type: 'INCUBATOR', programsLimit: 1, cohortsLimit: 2, _count: { programs: 0 } }) },
    program: {
      findMany: async () => [],
      findFirst: async () => ({ id: 'program-1', status: 'DRAFT', organization: { cohortsLimit: 2, _count: { programs: 1 } } }),
      create: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'program-1', ...data, status: 'DRAFT', createdAt: new Date(), updatedAt: new Date(), _count: { cohorts: 0, opportunities: 0 } }),
      update: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'program-1', ...data, createdAt: new Date(), updatedAt: new Date(), _count: { cohorts: 0, opportunities: 0 } }),
    },
    cohort: {
      findMany: async () => [],
      findFirst: async () => ({ id: 'cohort-1', programId: 'program-1', status: 'PLANNED' }),
      count: async () => 0,
      create: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'cohort-1', ...data, status: 'PLANNED', createdAt: new Date(), updatedAt: new Date(), _count: { opportunities: 0 } }),
      update: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'cohort-1', ...data, status: 'OPEN', createdAt: new Date(), updatedAt: new Date(), _count: { opportunities: 0 } }),
    },
    opportunityApplication: { findMany: async () => [] },
    ...overrides,
  } as unknown as PrismaService
  const audit = { record: async () => undefined } as unknown as AuditService
  return new IncubatorService(prisma, audit)
}

test('INC-001 — seul un membre d’une organisation INCUBATOR peut gérer les programmes', async () => {
  const service = createService()
  const program = await service.createProgram('admin-1', 'org-incubator', { name: 'Pré-incubation 2027', description: 'Programme de test multi-cohortes.' })
  assert.equal(program.name, 'Pré-incubation 2027')

  const forbidden = createService({ organizationMember: { findUnique: async () => ({ role: 'ORG_ADMIN', user: { status: 'ACTIVE' }, organization: { type: 'COMPANY' } }) } })
  await assert.rejects(() => forbidden.listPrograms('admin-1', 'org-company'), (error: unknown) => error instanceof ForbiddenException)
})

test('INC-002 — crée une cohorte rattachée au programme et ouvre son statut', async () => {
  const service = createService()
  const cohort = await service.createCohort('admin-1', 'org-incubator', 'program-1', { name: 'Antananarivo S1 2027', region: 'Analamanga' })
  assert.equal(cohort.programId, 'program-1')
  const opened = await service.openCohort('admin-1', 'org-incubator', 'cohort-1')
  assert.equal(opened.status, 'OPEN')
})

test('INC-003 — bloque la création quand la limite de programmes du plan est atteinte', async () => {
  const service = createService({ organization: { findUnique: async () => ({ type: 'INCUBATOR', programsLimit: 1, cohortsLimit: 2, _count: { programs: 1 } }) } })
  await assert.rejects(() => service.createProgram('admin-1', 'org-incubator', { name: 'Programme excédentaire' }), (error: unknown) => error instanceof ConflictException)
})

test('INC-004 — transmet les filtres programme, cohorte et statut au pipeline de candidatures', async () => {
  let received: Record<string, unknown> | undefined
  const service = createService({ opportunityApplication: { findMany: async (args: { where: Record<string, unknown> }) => { received = args.where; return [] } } })
  await service.listApplications('admin-1', 'org-incubator', { programId: 'program-1', cohortId: 'cohort-1', status: 'SHORTLISTED' })
  assert.deepEqual(received, { opportunity: { organizationId: 'org-incubator', programId: 'program-1', cohortId: 'cohort-1' }, status: 'SHORTLISTED' })
})
