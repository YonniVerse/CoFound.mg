import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { BadRequestException, Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DreamMatchController } from '../src/dream-match/dream-match.controller.js'
import { DreamMatchScoringController } from '../src/dream-match/dream-match-scoring.controller.js'
import { DreamMatchScoringService } from '../src/dream-match/dream-match-scoring.service.js'
import { DreamMatchService } from '../src/dream-match/dream-match.service.js'

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
