import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConsentController } from '../src/consent/consent.controller.js'
import { ConsentService } from '../src/consent/consent.service.js'

async function startApp() {
  const calls: Array<{ method: string; purpose?: string }> = []
  const fake = {
    listMine: async (userId: string) => { calls.push({ method: `list:${userId}` }); return { consents: [] } },
    grant: async (userId: string, purpose: string) => { calls.push({ method: `grant:${userId}`, purpose }); return { id: 'consent-1', purpose, policyVersion: 'v1', grantedAt: new Date(), revokedAt: null, active: true } },
    revoke: async (userId: string, purpose: string) => { calls.push({ method: `revoke:${userId}`, purpose }); return { id: 'consent-1', purpose, policyVersion: 'v1', grantedAt: new Date(), revokedAt: new Date(), active: false } },
  }
  @Module({ controllers: [ConsentController], providers: [{ provide: ConsentService, useValue: fake }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'user-1' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0)
  const address = app.getHttpServer().address() as { port: number }
  return { app, baseUrl: `http://127.0.0.1:${address.port}`, calls }
}

test('E-15 expose le registre, l’octroi et le retrait par HTTP', async () => {
  const { app, baseUrl, calls } = await startApp()
  try {
    const list = await fetch(`${baseUrl}/api/v1/me/consents`)
    assert.equal(list.status, 200)
    assert.deepEqual(await list.json(), { consents: [] })
    const grant = await fetch(`${baseUrl}/api/v1/me/consents/PROFILE_VISIBILITY`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ policyVersion: 'v1' }) })
    assert.equal(grant.status, 201)
    const revoke = await fetch(`${baseUrl}/api/v1/me/consents/PROFILE_VISIBILITY`, { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ confirm: true }) })
    assert.equal(revoke.status, 200)
    assert.deepEqual(calls, [{ method: 'list:user-1' }, { method: 'grant:user-1', purpose: 'PROFILE_VISIBILITY' }, { method: 'revoke:user-1', purpose: 'PROFILE_VISIBILITY' }])
  } finally { await app.close() }
})
