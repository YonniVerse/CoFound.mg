import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { BadRequestException, Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DreamMatchController } from '../src/dream-match/dream-match.controller.js'
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
