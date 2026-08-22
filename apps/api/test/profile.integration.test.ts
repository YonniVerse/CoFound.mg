import 'reflect-metadata'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ProfileController, ProfileIdentityController } from '../src/profile/profile.controller.js'
import { ProfileService } from '../src/profile/profile.service.js'

function createFakeService() {
  const calls: { userId?: string; input?: unknown } = {}
  const service: Pick<ProfileService, 'getMine' | 'updateMine' | 'getIdentity' | 'updateIdentity'> = {
    getMine: async (userId) => ({ user: { id: userId, email: 'talent@example.mg', locale: 'fr' }, identity: null, profile: null, minimumCompletion: 60 }),
    updateMine: async (userId, input) => { calls.userId = userId; calls.input = input; return { profile: { id: 'profile-1', userId, pseudonym: 'Ravinala' }, minimumCompletion: 60 } as never },
    getIdentity: async () => ({ firstName: 'Ravinala', lastName: 'Andry', photoKey: null, phone: null, regionId: null, gender: null }),
    updateIdentity: async (_userId, input) => ({ identity: input }) as never,
  }
  return { calls, service }
}

async function startTestApp() {
  const fake = createFakeService()
  @Module({ controllers: [ProfileController, ProfileIdentityController], providers: [{ provide: ProfileService, useValue: fake.service }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'anonymous' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  return { app, fake }
}

test('E-12 expose GET et PATCH /api/v1/me/profile via HTTP', async () => {
  const { app, fake } = await startTestApp()
  try {
    const baseUrl = await app.getUrl()
    const getResponse = await fetch(`${baseUrl}/api/v1/me/profile`, { headers: { authorization: 'Bearer test-token' } })
    const getRaw = await getResponse.text()
    assert.equal(getResponse.status, 200, getRaw)
    const getBody = JSON.parse(getRaw) as { user: { id: string } }
    assert.equal(getBody.user.id, 'anonymous')

    const input = { pseudonym: 'Ravinala', goals: [], sectorIds: [], visibleInTalentFeed: false }
    const patchResponse = await fetch(`${baseUrl}/api/v1/me/profile`, { method: 'PATCH', headers: { 'content-type': 'application/json', authorization: 'Bearer test-token' }, body: JSON.stringify(input) })
    assert.equal(patchResponse.status, 200)
    assert.deepEqual(fake.calls, { userId: 'anonymous', input })

    const identityResponse = await fetch(`${baseUrl}/api/v1/me/identity`, { headers: { authorization: 'Bearer test-token' } })
    assert.equal(identityResponse.status, 200)
    const identityBody = await identityResponse.json() as { firstName: string; gender: string | null }
    assert.equal(identityBody.firstName, 'Ravinala')
    assert.equal(identityBody.gender, null)
  } finally {
    await app.close()
  }
})
