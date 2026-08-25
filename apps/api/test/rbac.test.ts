import 'reflect-metadata'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ForbiddenException, UnauthorizedException } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AccessTokenGuard } from '../src/rbac/access-token.guard.js'
import { PermissionGuard } from '../src/rbac/permission.guard.js'
import { ANONYMOUS_KEY, PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { Permission, PLATFORM_ROLE_PERMISSIONS } from '../src/rbac/permissions.js'
import { ProfileController, ProfileIdentityController } from '../src/profile/profile.controller.js'
import { CompletionReminderController } from '../src/profile/completion-reminder.controller.js'
import { OnboardingController } from '../src/onboarding/onboarding.controller.js'
import { DreamMatchController } from '../src/dream-match/dream-match.controller.js'
import { DreamMatchScoringController } from '../src/dream-match/dream-match-scoring.controller.js'
import { PublicOpportunityController } from '../src/organization-request/opportunity.controller.js'
import { SignJWT } from 'jose'
import { getJwtSecret } from '../src/auth/jwt-secret.js'

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

async function signedToken(platformRole: string): Promise<string> {
  return new SignJWT({ platformRole, status: 'ACTIVE' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('user-test')
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getJwtSecret())
}

const permissionGuard = new PermissionGuard(new Reflector())

const negativeCases: Array<[string, string, Permission]> = [
  ['un talent ne peut pas gérer une organisation', 'TALENT', Permission.ORG_MANAGE],
  ['un talent ne peut pas agir en modération', 'TALENT', Permission.MODERATION_ACT],
  ['un membre organisation ne peut pas créer un projet', 'ORG_MEMBER', Permission.PROJECT_CREATE],
  ['un membre organisation ne peut pas gérer un projet', 'ORG_MEMBER', Permission.PROJECT_MANAGE],
  ['un membre organisation ne peut pas envoyer un message', 'ORG_MEMBER', Permission.MESSAGE_SEND],
  ['un membre organisation ne peut pas gérer les capacités', 'ORG_MEMBER', Permission.ORGANIZATION_CAPABILITY_MANAGE],
  ['un membre organisation ne peut pas lire les audits', 'ORG_MEMBER', Permission.AUDIT_READ],
  ['un membre organisation ne peut pas lire la santé produit', 'ORG_MEMBER', Permission.PRODUCT_HEALTH_READ],
  ['un membre organisation ne peut pas gérer les référentiels', 'ORG_MEMBER', Permission.REFERENCE_DATA_MANAGE],
  ['un membre organisation ne peut pas gérer les demandes organisationnelles', 'ORG_MEMBER', Permission.ORGANIZATION_REQUEST_MANAGE],
  ['un staff sans permission étendue ne peut pas agir en modération', 'STAFF', Permission.MODERATION_ACT],
  ['un rôle inconnu ne reçoit aucune permission', 'UNKNOWN_ROLE', Permission.TALENT_READ],
]

for (const [description, platformRole, permission] of negativeCases) {
  test(`F-19 — ${description}`, () => {
    const request: Request = {
      headers: {},
      user: { userId: 'user-test', platformRole, status: 'ACTIVE' },
    }
    assert.throws(
      () => permissionGuard.canActivate(contextFor(request, [permission])),
      (error: unknown) => error instanceof ForbiddenException,
    )
  })
}

test('F-20 — les parcours personnels TALENT ne sont pas accordés aux ORG_MEMBER', () => {
  assert.equal(PLATFORM_ROLE_PERMISSIONS.TALENT?.includes(Permission.TALENT_SELF), true)
  assert.equal(PLATFORM_ROLE_PERMISSIONS.ORG_MEMBER?.includes(Permission.TALENT_SELF), false)
  assert.equal(PLATFORM_ROLE_PERMISSIONS.STAFF?.includes(Permission.TALENT_SELF), false)

  const talent: Request = { headers: {}, user: { userId: 'talent', platformRole: 'TALENT', status: 'ACTIVE' } }
  const orgAdmin: Request = { headers: {}, user: { userId: 'admin', platformRole: 'ORG_MEMBER', status: 'ACTIVE' } }

  assert.equal(permissionGuard.canActivate(contextFor(talent, [Permission.TALENT_SELF])), true)
  assert.throws(() => permissionGuard.canActivate(contextFor(orgAdmin, [Permission.TALENT_SELF])), ForbiddenException)

  for (const controller of [ProfileController, ProfileIdentityController, CompletionReminderController, OnboardingController, DreamMatchController, DreamMatchScoringController]) {
    assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, controller), [Permission.TALENT_SELF])
  }
})

test('F-21 — la lecture publique est anonyme mais la candidature reste protégée', () => {
  const listPublished = PublicOpportunityController.prototype.listPublished
  const apply = PublicOpportunityController.prototype.apply
  assert.equal(Reflect.getMetadata(ANONYMOUS_KEY, listPublished), true)
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, apply), [Permission.PROJECT_APPLY])
})

test('B-02 — seul SUPER_ADMIN peut consulter et gérer les organisations', () => {
  const superAdmin = { headers: {}, user: { userId: 'admin', platformRole: 'STAFF', status: 'ACTIVE', staffRole: 'SUPER_ADMIN' } }
  const opsAdmin = { headers: {}, user: { userId: 'ops', platformRole: 'STAFF', status: 'ACTIVE', staffRole: 'OPS_ADMIN' } }
  assert.equal(permissionGuard.canActivate(contextFor(superAdmin, [Permission.ORGANIZATION_REQUEST_READ])), true)
  assert.equal(permissionGuard.canActivate(contextFor(superAdmin, [Permission.ORGANIZATION_REQUEST_MANAGE])), true)
  assert.throws(() => permissionGuard.canActivate(contextFor(opsAdmin, [Permission.ORGANIZATION_REQUEST_READ])), ForbiddenException)
})

test('S-05 — SUPER_ADMIN gère les référentiels', () => {
  const request: Request = { headers: {}, user: { userId: 'staff', platformRole: 'STAFF', status: 'ACTIVE', staffRole: 'SUPER_ADMIN' } }
  assert.equal(permissionGuard.canActivate(contextFor(request, [Permission.REFERENCE_DATA_MANAGE])), true)
})

test('S-05 — OPS_ADMIN lit la santé produit', () => {
  const request: Request = { headers: {}, user: { userId: 'ops', platformRole: 'STAFF', status: 'ACTIVE', staffRole: 'OPS_ADMIN' } }
  assert.equal(permissionGuard.canActivate(contextFor(request, [Permission.PRODUCT_HEALTH_READ])), true)
})

test('S-05 — MODERATOR ne gère pas les référentiels ni la santé produit', () => {
  const request: Request = { headers: {}, user: { userId: 'moderator', platformRole: 'STAFF', status: 'ACTIVE', staffRole: 'MODERATOR' } }
  assert.throws(() => permissionGuard.canActivate(contextFor(request, [Permission.REFERENCE_DATA_MANAGE])), ForbiddenException)
  assert.throws(() => permissionGuard.canActivate(contextFor(request, [Permission.PRODUCT_HEALTH_READ])), ForbiddenException)
})

test('F-19 — une route protégée sans Bearer est refusée', async () => {
  const accessGuard = new AccessTokenGuard(new Reflector())
  await assert.rejects(
    () => accessGuard.canActivate(contextFor({ headers: {} })),
    (error: unknown) => error instanceof UnauthorizedException,
  )
})

test('F-19 — un Bearer invalide est refusé', async () => {
  const accessGuard = new AccessTokenGuard(new Reflector())
  await assert.rejects(
    () => accessGuard.canActivate(contextFor({ headers: { authorization: 'Bearer invalid' } })),
    (error: unknown) => error instanceof UnauthorizedException,
  )
})

test('F-19 — un Bearer valide injecte le contexte utilisateur', async () => {
  const accessGuard = new AccessTokenGuard(new Reflector())
  const request: Request = { headers: { authorization: `Bearer ${await signedToken('TALENT')}` } }
  assert.equal(await accessGuard.canActivate(contextFor(request)), true)
  assert.deepEqual(request.user, { userId: 'user-test', platformRole: 'TALENT', status: 'ACTIVE' })
})

test('MOD-005 et OPS-003 à OPS-005 — les surfaces staff sensibles restent réservées', () => {
  const ops: Request = { headers: {}, user: { userId: 'ops', platformRole: 'STAFF', status: 'ACTIVE', staffRole: 'OPS_ADMIN' } }
  const moderator: Request = { headers: {}, user: { userId: 'moderator', platformRole: 'STAFF', status: 'ACTIVE', staffRole: 'MODERATOR' } }

  for (const permission of [Permission.ORGANIZATION_REQUEST_READ, Permission.ORGANIZATION_REQUEST_MANAGE, Permission.REFERENCE_DATA_MANAGE, Permission.AUDIT_READ]) {
    assert.throws(() => permissionGuard.canActivate(contextFor(ops, [permission])), ForbiddenException)
  }
  for (const permission of [Permission.ORGANIZATION_REQUEST_READ, Permission.ORGANIZATION_REQUEST_MANAGE, Permission.REFERENCE_DATA_MANAGE, Permission.PRODUCT_HEALTH_READ, Permission.AUDIT_READ]) {
    assert.throws(() => permissionGuard.canActivate(contextFor(moderator, [permission])), ForbiddenException)
  }
})
