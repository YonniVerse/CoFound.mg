import 'reflect-metadata'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ForbiddenException, UnauthorizedException } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AccessTokenGuard } from '../src/rbac/access-token.guard.js'
import { PermissionGuard } from '../src/rbac/permission.guard.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { Permission } from '../src/rbac/permissions.js'
import { PrivacyService } from '../src/privacy/privacy.service.js'
import { InstitutionDirectoryService } from '../src/institution/institution-directory.service.js'
import { InstitutionAffiliationService } from '../src/institution/institution-affiliation.service.js'
import { ReportService } from '../src/report/report.service.js'
import { PartnerDiscoveryService } from '../src/organization-request/partner-discovery.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { AuditService } from '../src/audit/audit.service.js'

type Request = {
  headers: { authorization?: string }
  user?: { userId: string; platformRole: string; status: string; staffRole?: string }
}

function contextFor(request: Request, permissions?: Permission[]): ExecutionContext {
  const handler = () => undefined
  if (permissions) Reflect.defineMetadata(PERMISSIONS_KEY, permissions, handler)
  return {
    getHandler: () => handler,
    getClass: () => class TestController {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext
}

const permissionGuard = new PermissionGuard(new Reflector())
const accessGuard = new AccessTokenGuard(new Reflector())

// 1. Matrice des permissions négatives par rôle plateforme
test('SEC-01: TALENT ne peut pas accéder aux espaces institutionnels (ORG_READ / ORG_MANAGE)', () => {
  const studentRequest: Request = {
    headers: {},
    user: { userId: 'student-1', platformRole: 'TALENT', status: 'ACTIVE' },
  }

  assert.throws(
    () => permissionGuard.canActivate(contextFor(studentRequest, [Permission.ORG_READ])),
    (err: unknown) => err instanceof ForbiddenException,
  )
  assert.throws(
    () => permissionGuard.canActivate(contextFor(studentRequest, [Permission.ORG_MANAGE])),
    (err: unknown) => err instanceof ForbiddenException,
  )
})

test('SEC-02: TALENT ne peut pas accéder aux consoles Staff / Audit / Modération', () => {
  const studentRequest: Request = {
    headers: {},
    user: { userId: 'student-1', platformRole: 'TALENT', status: 'ACTIVE' },
  }

  assert.throws(
    () => permissionGuard.canActivate(contextFor(studentRequest, [Permission.AUDIT_READ])),
    (err: unknown) => err instanceof ForbiddenException,
  )
  assert.throws(
    () => permissionGuard.canActivate(contextFor(studentRequest, [Permission.MODERATION_READ])),
    (err: unknown) => err instanceof ForbiddenException,
  )
  assert.throws(
    () => permissionGuard.canActivate(contextFor(studentRequest, [Permission.MODERATION_ACT])),
    (err: unknown) => err instanceof ForbiddenException,
  )
  assert.throws(
    () => permissionGuard.canActivate(contextFor(studentRequest, [Permission.ORGANIZATION_REQUEST_READ])),
    (err: unknown) => err instanceof ForbiddenException,
  )
})

test('SEC-03: ORG_MEMBER ne peut pas accéder à la modération, à l’audit ni à la santé produit', () => {
  const orgAdminRequest: Request = {
    headers: {},
    user: { userId: 'cadre-1', platformRole: 'ORG_MEMBER', status: 'ACTIVE' },
  }

  assert.throws(
    () => permissionGuard.canActivate(contextFor(orgAdminRequest, [Permission.MODERATION_READ])),
    (err: unknown) => err instanceof ForbiddenException,
  )
  assert.throws(
    () => permissionGuard.canActivate(contextFor(orgAdminRequest, [Permission.AUDIT_READ])),
    (err: unknown) => err instanceof ForbiddenException,
  )
  assert.throws(
    () => permissionGuard.canActivate(contextFor(orgAdminRequest, [Permission.PRODUCT_HEALTH_READ])),
    (err: unknown) => err instanceof ForbiddenException,
  )
  assert.throws(
    () => permissionGuard.canActivate(contextFor(orgAdminRequest, [Permission.ORGANIZATION_REQUEST_MANAGE])),
    (err: unknown) => err instanceof ForbiddenException,
  )
})

// 2. Isolation Tenant / Multi-institution
test('SEC-04: Isolation stricte — Institution A ne peut pas accéder aux données de l’Institution B', async () => {
  const mockPrisma = {
    organizationMember: {
      findUnique: async ({ where }: { where: { organizationId_userId: { organizationId: string; userId: string } } }) => {
        // L'utilisateur appartient uniquement à org-A
        if (where.organizationId_userId.organizationId === 'org-A' && where.organizationId_userId.userId === 'user-org-A') {
          return { role: 'ORG_ADMIN', organizationId: 'org-A', userId: 'user-org-A' }
        }
        return null
      },
    },
    affiliation: {
      findMany: async () => [],
    },
  } as unknown as PrismaService

  const directoryService = new InstitutionDirectoryService(mockPrisma)

  // Accès légitime à sa propre organisation org-A -> OK
  await assert.doesNotReject(async () => {
    await directoryService.list('org-A', 'user-org-A', {})
  })

  // Tentative d'accès frauduleuse aux données de org-B -> ForbiddenException
  await assert.rejects(
    async () => {
      await directoryService.list('org-B', 'user-org-A', {})
    },
    (err: unknown) => err instanceof ForbiddenException,
  )
})

test('SEC-05: Isolation des affiliations — Rejet des modifications d’affiliations inter-institutions', async () => {
  const mockPrisma = {
    affiliation: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        if (where.id === 'aff-B1') return { id: 'aff-B1', organizationId: 'org-B', status: 'ACTIVE' }
        return null
      },
    },
    organizationMember: {
      findUnique: async ({ where }: { where: { organizationId_userId: { organizationId: string; userId: string } } }) => {
        // L'utilisateur est admin de org-A seulement
        if (where.organizationId_userId.organizationId === 'org-A' && where.organizationId_userId.userId === 'user-org-A') {
          return { role: 'ORG_ADMIN', organizationId: 'org-A', userId: 'user-org-A' }
        }
        return null
      },
    },
  } as unknown as PrismaService

  const affiliationService = new InstitutionAffiliationService(mockPrisma)

  await assert.rejects(
    async () => {
      await affiliationService.update('aff-B1', 'user-org-A', 'ALUMNI')
    },
    (err: unknown) => err instanceof ForbiddenException,
  )
})

// 3. Protection de l’identité et pseudonymat
test('SEC-06: Privacy — Un tiers ou un partenaire ne reçoit QUE la vue pseudonymisée sans identité réelle', async () => {
  const mockPrisma = {
    talentProfile: {
      findUnique: async () => ({
        id: 'tp-1',
        userId: 'user-talent-1',
        pseudonym: 'Hery Tech',
        avatarSeed: 'seed123',
        headline: 'Ingénieur mécatronique',
        bio: 'Passionné d’IoT',
        fieldId: 'field-1',
        cohortYear: 2025,
        availabilityHours: 15,
        completion: 90,
        user: { status: 'ACTIVE' },
      }),
    },
    connection: {
      findFirst: async () => null, // Aucune connexion avec consentement mutuel
    },
    talentIdentity: {
      findUnique: async () => ({
        firstName: 'Hery',
        lastName: 'Andrianina',
        phone: '+261340000000',
        photoKey: 'photo.jpg',
      }),
    },
  } as unknown as PrismaService

  const privacyService = new PrivacyService(mockPrisma)

  const view = await privacyService.getTalentView('viewer-stranger-id', 'tp-1')
  assert.equal(view.revealed, false)
  assert.equal(view.pseudonym, 'Hery Tech')
  assert.equal('firstName' in view, false)
  assert.equal('lastName' in view, false)
  assert.equal('phone' in view, false)
})

test('SEC-07: Partner Discovery — La recherche partenaire ne renvoie pas l’identité réelle', async () => {
  const mockPrisma = {
    organizationMember: {
      findUnique: async () => ({
        user: { status: 'ACTIVE' },
        organization: { capabilities: [{ capability: 'RECRUIT' }] },
      }),
    },
    talentProfile: {
      findMany: async () => [
        {
          pseudonym: 'Toky Dev',
          avatarSeed: 'seed456',
          headline: 'Fintech dev',
          bio: 'Bio',
          fieldId: 'field-cs',
          completion: 95,
        },
      ],
    },
  } as unknown as PrismaService

  const partnerDiscoveryService = new PartnerDiscoveryService(mockPrisma)
  const results = await partnerDiscoveryService.searchTalents('partner-user-1', 'org-partner', {})

  assert.equal(results.items.length, 1)
  assert.equal(results.items[0]?.pseudonym, 'Toky Dev')
  assert.equal(results.items[0]?.revealed, false)
  assert.equal('firstName' in results.items[0]!, false)
  assert.equal('email' in results.items[0]!, false)
})

// 4. Audit obligatoire sur accès modérateur à l'identité
test('SEC-08: Modération — La levée de pseudonymat par un modérateur est obligatoirement auditée', async () => {
  let auditRecorded = false
  let auditAction = ''

  const mockAudit = {
    record: async (payload: { action: string; targetType: string; targetId: string }) => {
      auditRecorded = true
      auditAction = payload.action
    },
  } as unknown as AuditService

  const mockPrisma = {
    report: {
      findUnique: async () => ({
        id: 'rep-1',
        targetType: 'PROFILE',
        targetId: 'tp-1',
        reason: 'Contenu inapproprié',
      }),
    },
    talentProfile: {
      findUnique: async () => ({ userId: 'target-user-1' }),
    },
    user: {
      findUnique: async () => ({
        id: 'target-user-1',
        email: 'target@test.mg',
        talentIdentity: { firstName: 'Jean', lastName: 'Rakoto' },
      }),
    },
  } as unknown as PrismaService

  const reportService = new ReportService(mockPrisma, undefined, mockAudit)
  const identity = await reportService.revealIdentity('moderator-user-id', 'rep-1')

  assert.equal(identity.firstName, 'Jean')
  assert.equal(identity.lastName, 'Rakoto')
  assert.equal(auditRecorded, true)
  assert.equal(auditAction, 'MODERATION_IDENTITY_REVEALED')
})

// 5. Refus par défaut pour requêtes non authentifiées
test('SEC-09: Unauthenticated — Toute requête sans token Bearer est rejetée (401)', async () => {
  const request: Request = { headers: {} }
  await assert.rejects(
    async () => {
      await accessGuard.canActivate(contextFor(request))
    },
    (err: unknown) => err instanceof UnauthorizedException,
  )
})
