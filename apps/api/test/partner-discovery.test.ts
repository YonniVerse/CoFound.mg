import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { OrganizationProfileService } from '../src/organization-request/organization-profile.service.js'
import { PartnerDiscoveryService } from '../src/organization-request/partner-discovery.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

const verifiedOrganization = {
  id: 'org-1', name: 'Incubateur Test', type: 'INCUBATOR', countryCode: 'MG', logoKey: null,
  description: 'Accompagnement de projets', verificationStatus: 'VERIFIED', capabilities: [{ capability: 'RECRUIT' }],
}

test('B-03 expose le profil public vérifié avec ses capacités', async () => {
  const prisma = { organization: { findFirst: async () => verifiedOrganization } } as unknown as PrismaService
  const result = await new OrganizationProfileService(prisma).getPublicProfile('org-1')
  assert.deepEqual(result.capabilities, ['RECRUIT'])
  assert.equal(result.verificationStatus, 'VERIFIED')
})

test('B-03 masque une organisation non vérifiée', async () => {
  const prisma = { organization: { findFirst: async () => null } } as unknown as PrismaService
  await assert.rejects(() => new OrganizationProfileService(prisma).getPublicProfile('org-pending'), (error: unknown) => error instanceof NotFoundException)
})

test('B-04 filtre la recherche projet sur la maturité BMC pour un recruteur', async () => {
  let where: unknown
  const prisma = {
    organizationMember: { findUnique: async () => ({ user: { status: 'ACTIVE' }, organization: { capabilities: [{ capability: 'RECRUIT' }] } }) },
    project: { findMany: async (args: { where: unknown }) => { where = args.where; return [{ id: 'project-1', title: 'Projet solaire', pitch: 'Une solution solaire', status: 'RECRUITING', sectorId: null, regionId: null, createdAt: new Date(), canvas: { completion: 72 } }] } },
  } as unknown as PrismaService
  const result = await new PartnerDiscoveryService(prisma).search('user-1', 'org-1', { q: 'solaire', minMaturity: 60, maxMaturity: 80 })
  assert.equal(result.items[0]?.maturity, 72)
  assert.ok(where)
})

test('B-05 interdit le suivi sans capacité RECRUIT', async () => {
  const prisma = { organizationMember: { findUnique: async () => ({ user: { status: 'ACTIVE' }, organization: { capabilities: [] } }) } } as unknown as PrismaService
  await assert.rejects(() => new PartnerDiscoveryService(prisma).listWatches('user-1', 'org-1'), (error: unknown) => error instanceof ForbiddenException)
})

test('B-05 crée ou met à jour une note privée de suivi', async () => {
  const prisma = {
    organizationMember: { findUnique: async () => ({ user: { status: 'ACTIVE' }, organization: { capabilities: [{ capability: 'RECRUIT' }] } }) },
    project: { findFirst: async () => ({ id: 'project-1' }) },
    projectWatch: { upsert: async () => ({ id: 'watch-1', projectId: 'project-1', note: 'Rappeler après le prochain comité', createdAt: new Date(), updatedAt: new Date() }) },
  } as unknown as PrismaService
  const result = await new PartnerDiscoveryService(prisma).saveWatch('user-1', 'org-1', 'project-1', { note: 'Rappeler après le prochain comité' })
  assert.equal(result.organizationId, 'org-1')
  assert.equal(result.note, 'Rappeler après le prochain comité')
})
