import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { PersonalDataExportController } from '../src/privacy/personal-data-export.controller.js'
import { PersonalDataExportService } from '../src/privacy/personal-data-export.service.js'

async function startTestApp() {
  const calls: Array<{ method: string; userId: string; id?: string; input?: unknown }> = []
  const fakeService = {
    request: async (userId: string, input: unknown) => { calls.push({ method: 'request', userId, input }); return { export: { id: 'export-1', status: 'PENDING', requestedAt: new Date(), completedAt: null, expiresAt: null, downloadAvailable: false } } },
    status: async (userId: string, id: string) => { calls.push({ method: 'status', userId, id }); return { export: { id, status: 'READY', requestedAt: new Date(), completedAt: new Date(), expiresAt: new Date(Date.now() + 3_600_000), downloadAvailable: true } } },
    download: async (userId: string, id: string) => { calls.push({ method: 'download', userId, id }); return { body: Buffer.from(JSON.stringify({ owner: userId })), filename: `cofound-export-${id}.json` } },
  }
  @Module({ controllers: [PersonalDataExportController], providers: [{ provide: PersonalDataExportService, useValue: fakeService }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: ['error'] })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'user-1' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  return { app, calls }
}

test('S-06 expose la demande et le statut de l’export via HTTP', async () => {
  const { app, calls } = await startTestApp()
  try {
    const baseUrl = await app.getUrl()
    const request = await fetch(`${baseUrl}/api/v1/me/privacy/exports`, { method: 'POST', headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' }, body: JSON.stringify({ confirmation: true }) })
    const requestBody = await request.text()
    assert.equal(request.status, 201, requestBody)
    const requested = JSON.parse(requestBody) as { export: { id: string; status: string } }
    assert.deepEqual(requested.export, { ...requested.export, id: 'export-1', status: 'PENDING' })

    const status = await fetch(`${baseUrl}/api/v1/me/privacy/exports/export-1`, { headers: { authorization: 'Bearer test-token' } })
    assert.equal(status.status, 200)
    assert.equal((await status.json() as { export: { downloadAvailable: boolean } }).export.downloadAvailable, true)
    assert.deepEqual(calls.map(({ method, userId, id }) => ({ method, userId, id })), [{ method: 'request', userId: 'user-1', id: undefined }, { method: 'status', userId: 'user-1', id: 'export-1' }])
  } finally { await app.close() }
})

test('S-06 expose le téléchargement avec un nom de fichier contrôlé', async () => {
  const { app, calls } = await startTestApp()
  try {
    const response = await fetch(`${await app.getUrl()}/api/v1/me/privacy/exports/export-1/download`, { headers: { authorization: 'Bearer test-token' } })
    const responseBody = await response.text()
    assert.equal(response.status, 200, responseBody)
    assert.match(response.headers.get('content-disposition') ?? '', /cofound-export-export-1\.json/)
    assert.deepEqual(JSON.parse(responseBody), { owner: 'user-1' })
    assert.deepEqual(calls[0], { method: 'download', userId: 'user-1', id: 'export-1' })
  } finally { await app.close() }
})
