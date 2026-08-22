import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ProjectMembersController } from '../src/project/project-members.controller.js'
import { ProjectMembersService } from '../src/project/project-members.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { Permission } from '../src/rbac/permissions.js'

const member = {
  id: 'm1', projectId: 'p1', userId: 'u2', role: 'MEMBER' as const, functionalRole: 'Designer', joinedAt: new Date(),
  user: { talentProfile: { pseudonym: 'Talent-42', avatarSeed: 'seed' }, talentIdentity: { firstName: 'Rina', lastName: 'Test' } },
}

test('P-08 révèle le nom uniquement dans l’espace équipe accessible', async () => {
  const prisma = {
    projectMember: {
      findFirst: async () => ({ id: 'owner', role: 'OWNER' }),
      findMany: async () => [member],
    },
  } as unknown as PrismaService
  const response = await new ProjectMembersService(prisma).list('p1', 'u1')
  assert.equal(response.items[0]!.displayName, 'Rina Test')
  assert.equal(response.items[0]!.pseudonym, 'Talent-42')
})

test('P-08 empêche la rétrogradation du dernier OWNER', async () => {
  const prisma = {
    projectMember: {
      findFirst: async () => ({ id: 'm1', role: 'OWNER' }),
    },
    $transaction: async (callback: (transaction: unknown) => Promise<unknown>) => callback({
      projectMember: {
        findFirst: async () => ({ id: 'm1', role: 'OWNER' }),
        count: async () => 1,
        update: async () => { throw new Error('ne doit pas être appelé') },
      },
    }),
  } as unknown as PrismaService
  await assert.rejects(
    () => new ProjectMembersService(prisma).updateRole('p1', 'u1', 'm1', 'MEMBER'),
    (error: { getResponse?: () => unknown }) => (error.getResponse?.() as { code?: string }).code === 'LAST_OWNER',
  )
})

test('P-08 expose les permissions de lecture et de gestion', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProjectMembersController.prototype.list), [Permission.PROJECT_READ])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProjectMembersController.prototype.updateRole), [Permission.PROJECT_MANAGE])
})
