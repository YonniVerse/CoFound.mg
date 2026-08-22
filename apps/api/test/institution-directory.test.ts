import assert from 'node:assert/strict'
import { test } from 'node:test'
import { OrganizationRole } from '@prisma/client'
import { InstitutionDirectoryService } from '../src/institution/institution-directory.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

test('E-19 refuse un acteur qui n’appartient pas à l’organisation', async () => {
  const prisma = { organizationMember: { findUnique: async () => null } } as unknown as PrismaService
  await assert.rejects(() => new InstitutionDirectoryService(prisma).list('org-1', 'actor', {}), /Accès annuaire refusé/)
})

test('E-19 filtre toujours les affiliations par organisation', async () => {
  let args: unknown
  const prisma = { organizationMember: { findUnique: async () => ({ role: OrganizationRole.ORG_VIEWER }) }, affiliation: { findMany: async (input: unknown) => { args = input; return [] } } } as unknown as PrismaService
  await new InstitutionDirectoryService(prisma).list('org-1', 'actor', { cohortYear: 2026 })
  assert.deepEqual(args, { where: { organizationId: 'org-1', cohortYear: 2026 }, include: { user: { select: { id: true, email: true, status: true, lastLoginAt: true, talentIdentity: { select: { firstName: true, lastName: true, photoKey: true } }, talentProfile: { select: { completion: true, field: { select: { labelKey: true } } }, }, projectMembers: { where: { leftAt: null }, select: { project: { select: { id: true, title: true, status: true } } } } } } }, orderBy: { startedAt: 'desc' } })
})

test('E-19 projection ne contient pas le genre, les conversations ni le contenu privé', async () => {
  const prisma = { organizationMember: { findUnique: async () => ({ role: OrganizationRole.ORG_VIEWER }) }, affiliation: { findMany: async () => [{ status: 'ACTIVE', cohortYear: 2026, user: { id: 'u1', email: 'student@example.com', status: 'ACTIVE', lastLoginAt: null, talentIdentity: { firstName: 'Ada', lastName: 'Lovelace', photoKey: null }, talentProfile: { completion: 80, field: { labelKey: 'informatique' } }, projectMembers: [{ project: { id: 'p1', title: 'Projet', status: 'DRAFT' } }] } }] } } as unknown as PrismaService
  const result = await new InstitutionDirectoryService(prisma).list('org-1', 'actor', {})
  const serialized = JSON.stringify(result)
  assert.match(serialized, /Ada Lovelace/)
  assert.doesNotMatch(serialized, /gender|conversation|pitch|canvas/i)
})
