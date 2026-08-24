import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConsentController } from '../src/consent/consent.controller.js'
import { ConsentService } from '../src/consent/consent.service.js'

async function startApp() {
  let requests = 0
  const fake = { listMine: async (userId: string) => { assert.equal(userId, 'user-load'); requests += 1; return { consents: [] } } }
  @Module({ controllers: [ConsentController], providers: [{ provide: ConsentService, useValue: fake }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'user-load' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0)
  const address = app.getHttpServer().address() as { port: number }
  return { app, baseUrl: `http://127.0.0.1:${address.port}`, getRequests: () => requests }
}

test('E-15 charge légère : 200 lectures concurrentes du registre', async () => {
  const { app, baseUrl, getRequests } = await startApp()
  try {
    const startedAt = performance.now()
    const responses = await Promise.all(Array.from({ length: 200 }, () => fetch(`${baseUrl}/api/v1/me/consents`)))
    const elapsed = performance.now() - startedAt
    assert.equal(responses.every((response) => response.status === 200), true)
    assert.equal(getRequests(), 200)
    assert.ok(elapsed < 5_000, `la charge légère a dépassé 5 secondes : ${Math.round(elapsed)} ms`)
  } finally { await app.close() }
})
