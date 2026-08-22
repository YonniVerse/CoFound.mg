import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { BadRequestException, Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DreamMatchController } from '../src/dream-match/dream-match.controller.js'
import { DreamMatchScoringController } from '../src/dream-match/dream-match-scoring.controller.js'
import { DreamMatchScoringService } from '../src/dream-match/dream-match-scoring.service.js'
import { DreamMatchService } from '../src/dream-match/dream-match.service.js'
import { ReportController } from '../src/report/report.controller.js'
import { ReportService } from '../src/report/report.service.js'
import { BlockController } from '../src/block/block.controller.js'
import { BlockService } from '../src/block/block.service.js'
import { NotificationController } from '../src/notifications/notification.controller.js'
import { NotificationService } from '../src/notifications/notification.service.js'
import { CompletionReminderController } from '../src/profile/completion-reminder.controller.js'
import { CompletionReminderService } from '../src/profile/completion-reminder.service.js'

function createFakeService() {
  const calls: Array<{ method: string; userId: string; input?: unknown }> = []
  const service: Pick<DreamMatchService, 'getMine' | 'upsertMine'> = {
    getMine: async (userId) => {
      calls.push({ method: 'getMine', userId })
      return { profile: null }
    },
    upsertMine: async (userId, input) => {
      calls.push({ method: 'upsertMine', userId, input })
      if (!input || typeof input !== 'object' || (input as { consent?: unknown }).consent !== true) {
        throw new BadRequestException('Le consentement matching est requis')
      }
      return {
        profile: {
          id: 'dream-1',
          talentId: 'talent-1',
          minAvailability: 12,
          preferredTeamSize: 4,
          institutionPref: null,
          sectors: [],
          skills: [],
        },
      }
    },
  }
  return { calls, service }
}

async function startTestApp() {
  const fake = createFakeService()
  @Module({ controllers: [DreamMatchController], providers: [{ provide: DreamMatchService, useValue: fake.service }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => {
    request.user = { userId: 'talent-user' }
    next()
  })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  return { app, fake }
}

test('M-05 expose GET/PATCH /api/v1/me/dream-match via HTTP', async () => {
  const { app, fake } = await startTestApp()
  try {
    const baseUrl = await app.getUrl()
    const getResponse = await fetch(`${baseUrl}/api/v1/me/dream-match`, { headers: { authorization: 'Bearer test-token' } })
    assert.equal(getResponse.status, 200)
    assert.deepEqual(await getResponse.json(), { profile: null })

    const input = { consent: true, minAvailability: 12, preferredTeamSize: 4, sectors: [], skills: [] }
    const patchResponse = await fetch(`${baseUrl}/api/v1/me/dream-match`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', authorization: 'Bearer test-token' },
      body: JSON.stringify(input),
    })
    assert.equal(patchResponse.status, 200)
    assert.equal((await patchResponse.json() as { profile: { talentId: string } }).profile.talentId, 'talent-1')
    assert.deepEqual(fake.calls[1], { method: 'upsertMine', userId: 'talent-user', input })
  } finally {
    await app.close()
  }
})


test('M-06 expose GET /api/v1/me/dream-match/suggestions via HTTP', async () => {
  const calls: Array<{ userId: string; input: unknown }> = []
  const fakeService: Pick<DreamMatchScoringService, 'getSuggestions'> = {
    getSuggestions: async (userId, input) => {
      calls.push({ userId, input })
      return {
        items: [{
          talentId: 'talent-2',
          pseudonym: 'Masoandro',
          avatarSeed: 'seed-2',
          headline: 'Designer',
          bio: null,
          score: 85,
          factors: { skillComplementarity: 40, sectorOverlap: 25, availability: 20 },
        }],
        nextCursor: null,
        hasMore: false,
      }
    },
  }
  @Module({ controllers: [DreamMatchScoringController], providers: [{ provide: DreamMatchScoringService, useValue: fakeService }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => {
    request.user = { userId: 'talent-user' }
    next()
  })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  try {
    const response = await fetch(`${await app.getUrl()}/api/v1/me/dream-match/suggestions?limit=10&cursor=talent-1`, {
      headers: { authorization: 'Bearer test-token' },
    })
    assert.equal(response.status, 200)
    const body = await response.json() as { items: Array<Record<string, unknown>>; hasMore: boolean }
    assert.equal(body.items[0]?.pseudonym, 'Masoandro')
    assert.equal(body.items[0]?.score, 85)
    assert.deepEqual(body.items[0]?.factors, { skillComplementarity: 40, sectorOverlap: 25, availability: 20 })
    assert.equal('firstName' in (body.items[0] ?? {}), false)
    assert.deepEqual(calls.map((call) => ({ userId: call.userId, input: { ...(call.input as Record<string, string>) } })), [{ userId: 'talent-user', input: { limit: '10', cursor: 'talent-1' } }])
  } finally {
    await app.close()
  }
})


test('M-13 expose le blocage utilisateur via HTTP sans identité civile', async () => {
  const calls: Array<{ blockerId: string; blockedId: string }> = []
  const fakeService: Pick<BlockService, 'create'> = {
    create: async (blockerId, blockedId) => {
      calls.push({ blockerId, blockedId })
      return { blocked: true, blockedId }
    },
  }
  @Module({ controllers: [BlockController], providers: [{ provide: BlockService, useValue: fakeService }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: ['error'] })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => {
    request.user = { userId: 'blocker-1' }
    next()
  })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  try {
    const response = await fetch(`${await app.getUrl()}/api/v1/blocks/talent-2`, { method: 'POST', headers: { authorization: 'Bearer test-token' } })
    const rawBody = await response.text()
    assert.equal(response.status, 201, rawBody)
    const body = JSON.parse(rawBody) as Record<string, unknown>
    assert.deepEqual(body, { blocked: true, blockedId: 'talent-2' })
    assert.equal('blockerId' in body, false)
    assert.deepEqual(calls, [{ blockerId: 'blocker-1', blockedId: 'talent-2' }])
  } finally {
    await app.close()
  }
})

test('M-14 expose la création d’un signalement via HTTP sans identité civile', async () => {
  const calls: Array<{ reporterId: string; input: unknown }> = []
  const fakeService: Pick<ReportService, 'create'> = {
    create: async (reporterId, input) => {
      calls.push({ reporterId, input })
      return { id: 'report-1', targetType: 'MESSAGE', targetId: 'message-2', reason: 'HARASSMENT', status: 'OPEN' }
    },
  }
  @Module({ controllers: [ReportController], providers: [{ provide: ReportService, useValue: fakeService }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => {
    request.user = { userId: 'reporter-1' }
    next()
  })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  try {
    const response = await fetch(`${await app.getUrl()}/api/v1/reports`, {
      method: 'POST',
      headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
      body: JSON.stringify({ targetType: 'MESSAGE', targetId: 'message-2', reason: 'HARASSMENT', description: 'Contenu à examiner' }),
    })
    assert.equal(response.status, 201)
    const body = await response.json() as Record<string, unknown>
    assert.deepEqual(body, { id: 'report-1', targetType: 'MESSAGE', targetId: 'message-2', reason: 'HARASSMENT', status: 'OPEN' })
    assert.equal('reporterId' in body, false)
    assert.deepEqual(calls, [{ reporterId: 'reporter-1', input: { targetType: 'MESSAGE', targetId: 'message-2', reason: 'HARASSMENT', description: 'Contenu à examiner' } }])
  } finally {
    await app.close()
  }
})

test('M-15 expose la liste et le marquage lu des notifications via HTTP', async () => {
  const fakeService: Pick<NotificationService, 'list' | 'markRead'> = {
    list: async (userId) => [{ id: 'notification-1', userId, type: 'MESSAGE_RECEIVED', payload: { conversationId: 'conversation-1' }, readAt: null, createdAt: new Date('2026-08-22T00:00:00.000Z') }],
    markRead: async (userId, id) => ({ id, read: true, owner: userId }),
  }
  @Module({ controllers: [NotificationController], providers: [{ provide: NotificationService, useValue: fakeService }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'notification-user' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  try {
    const base = await app.getUrl()
    const listResponse = await fetch(`${base}/api/v1/notifications`, { headers: { authorization: 'Bearer test-token' } })
    assert.equal(listResponse.status, 200)
    const items = await listResponse.json() as Array<Record<string, unknown>>
    assert.equal(items[0]?.userId, 'notification-user')
    const readResponse = await fetch(`${base}/api/v1/notifications/notification-1/read`, { method: 'PATCH', headers: { authorization: 'Bearer test-token' } })
    assert.equal(readResponse.status, 200)
    assert.deepEqual(await readResponse.json(), { id: 'notification-1', read: true, owner: 'notification-user' })
  } finally { await app.close() }
})

test('M-08 expose le retour pas intéressé via HTTP', async () => {
  const calls: Array<{ userId: string; talentId: string }> = []
  const fakeService: Pick<DreamMatchScoringService, 'markNotInterested'> = {
    markNotInterested: async (userId, talentId) => {
      calls.push({ userId, talentId })
      return { excluded: true, talentId }
    },
  }
  @Module({ controllers: [DreamMatchScoringController], providers: [{ provide: DreamMatchScoringService, useValue: fakeService }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => {
    request.user = { userId: 'talent-user' }
    next()
  })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  try {
    const response = await fetch(`${await app.getUrl()}/api/v1/me/dream-match/suggestions/talent-2/not-interested`, {
      method: 'POST',
      headers: { authorization: 'Bearer test-token' },
    })
    assert.equal(response.status, 201)
    assert.deepEqual(await response.json(), { excluded: true, talentId: 'talent-2' })
    assert.deepEqual(calls, [{ userId: 'talent-user', talentId: 'talent-2' }])
  } finally {
    await app.close()
  }
})


test('M-16 expose la résolution d’un signalement via HTTP', async () => {
  const calls: Array<{ actorId: string; reportId: string; input: unknown }> = []
  const fakeService: Pick<ReportService, 'resolve'> = {
    resolve: async (actorId, reportId, input) => {
      calls.push({ actorId, reportId, input })
      return { id: reportId, reporterId: 'reporter-1', status: 'RESOLVED', targetType: 'MESSAGE', targetId: 'message-2' }
    },
  }
  @Module({ controllers: [ReportController], providers: [{ provide: ReportService, useValue: fakeService }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => {
    request.user = { userId: 'moderator-1' }
    next()
  })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  try {
    const response = await fetch(`${await app.getUrl()}/api/v1/reports/report-1/resolve`, {
      method: 'PATCH',
      headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED' }),
    })
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { id: 'report-1', reporterId: 'reporter-1', status: 'RESOLVED', targetType: 'MESSAGE', targetId: 'message-2' })
    assert.deepEqual(calls, [{ actorId: 'moderator-1', reportId: 'report-1', input: { status: 'RESOLVED' } }])
  } finally {
    await app.close()
  }
})


test('E-14 expose GET /api/v1/me/profile/completion-reminder via HTTP', async () => {
  const calls: string[] = []
  const fakeService = {
    getMine: async (userId: string) => {
      calls.push(userId)
      return {
        shouldRemind: true,
        completion: 40,
        minimumCompletion: 70,
        missingFields: ['profile.fields.bio'],
        ctaPath: '/onboarding' as const,
      }
    },
  }
  @Module({
    controllers: [CompletionReminderController],
    providers: [{ provide: CompletionReminderService, useValue: fakeService }],
  })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => {
    request.user = { userId: 'talent-user' }
    next()
  })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  try {
    const response = await fetch(`${await app.getUrl()}/api/v1/me/profile/completion-reminder`, {
      headers: { authorization: 'Bearer test-token' },
    })
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      shouldRemind: true,
      completion: 40,
      minimumCompletion: 70,
      missingFields: ['profile.fields.bio'],
      ctaPath: '/onboarding',
    })
    assert.deepEqual(calls, ['talent-user'])
  } finally {
    await app.close()
  }
})
