import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AccountStatusController } from '../src/account-status/account-status.controller.js'
import { AccountStatusService } from '../src/account-status/account-status.service.js'

async function startTestApp(status: 'ACTIVE' | 'FROZEN' | 'LEAVING' | 'ALUMNI') {
  const fakeService = { getMine: async () => ({ status, messageKey: `account.status.${status.toLowerCase()}`, canAppeal: status === 'FROZEN', endsAt: null }) }
  @Module({ controllers: [AccountStatusController], providers: [{ provide: AccountStatusService, useValue: fakeService }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'user-1' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  return app
}

for (const status of ['ACTIVE', 'FROZEN', 'LEAVING', 'ALUMNI'] as const) {
  test(`S-07 expose le statut ${status} via HTTP`, async () => {
    const app = await startTestApp(status)
    try {
      const response = await fetch(`${await app.getUrl()}/api/v1/me/status`, { headers: { authorization: 'Bearer test-token' } })
      assert.equal(response.status, 200)
      const body = await response.json() as { status: string; canAppeal: boolean; messageKey: string }
      assert.equal(body.status, status)
      assert.equal(body.canAppeal, status === 'FROZEN')
      assert.equal(body.messageKey, `account.status.${status.toLowerCase()}`)
    } finally { await app.close() }
  })
}
