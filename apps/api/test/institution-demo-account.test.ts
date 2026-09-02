import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as argon2 from 'argon2'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { AuthService } from '../src/auth/auth.service.js'
import type { NotificationsQueueService } from '../src/notifications/notifications-queue.service.js'

test('INST-DEMO-01 le compte institution admin de test s’authentifie avec succès', async () => {
  const password = 'UnivTest2026!Secure'
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id })

  const mockUser = {
    id: 'demo-institution-admin',
    email: 'admin.test@univ-test.mg',
    passwordHash,
    status: 'ACTIVE',
    platformRole: 'ORG_MEMBER',
    staffRole: null,
  }

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { email: string } }) => {
        if (where.email === 'admin.test@univ-test.mg') return mockUser
        return null
      },
      update: async () => mockUser,
    },
    refreshToken: {
      create: async () => ({ id: 'rt_1' }),
    },
  } as unknown as PrismaService

  const notificationsQueue = {} as unknown as NotificationsQueueService
  const authService = new AuthService(prisma, notificationsQueue)

  const session = await authService.login({
    email: 'admin.test@univ-test.mg',
    password,
  })

  assert.ok(session.accessToken)
  assert.ok(session.refreshToken)
  assert.ok(session.refreshTokenExpiresAt instanceof Date)
})
