import 'reflect-metadata'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ProjectExportController } from '../src/project/project-export.controller.js'
import { ProjectExportService } from '../src/project/project-export.service.js'

async function startTestApp() {
  const service: Pick<ProjectExportService, 'export'> = {
    export: async () => ({ archiveVersion: 1, project: { id: 'project-1' }, metadata: { pseudonymized: true } }) as never,
  }
  @Module({ controllers: [ProjectExportController], providers: [{ provide: ProjectExportService, useValue: service }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: ['error'] })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'owner-1' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  return app
}

test('P-12 expose le téléchargement JSON de l’archive projet', async () => {
  const app = await startTestApp()
  try {
    const response = await fetch(`${await app.getUrl()}/api/v1/projects/project-1/export`, { headers: { authorization: 'Bearer test-token' } })
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-disposition') ?? '', /project-archive\.json/)
    const body = await response.json() as { archiveVersion: number; metadata: { pseudonymized: boolean } }
    assert.equal(body.archiveVersion, 1)
    assert.equal(body.metadata.pseudonymized, true)
  } finally {
    await app.close()
  }
})
