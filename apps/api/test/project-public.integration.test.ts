import 'reflect-metadata'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ProjectPublicController } from '../src/project/project-public.controller.js'
import { ProjectPublicService } from '../src/project/project-public.service.js'

async function startTestApp() {
  const service: Pick<ProjectPublicService, 'getPublic'> = {
    getPublic: async () => ({ id: 'project-1', title: 'Projet public', pitch: 'Pitch public suffisamment détaillé', status: 'RECRUITING', sectorId: null, regionId: null, publicBmc: { channels: { content: 'Canal public', isPublic: true } }, members: [{ pseudonym: 'Talent-Atlas', avatarSeed: 'atlas', role: 'MEMBER' }], positions: [], posts: [] }),
  }
  @Module({ controllers: [ProjectPublicController], providers: [{ provide: ProjectPublicService, useValue: service }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: ['error'] })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  return app
}

test('P-13 expose le détail public sans identité civile ni blocs privés', async () => {
  const app = await startTestApp()
  try {
    const response = await fetch(`${await app.getUrl()}/api/v1/projects/project-1/public`)
    assert.equal(response.status, 200)
    const body = await response.json() as { members: Array<{ pseudonym: string }>; publicBmc: Record<string, unknown> }
    assert.equal(body.members[0]?.pseudonym, 'Talent-Atlas')
    assert.equal('firstName' in (body.members[0] ?? {}), false)
    assert.deepEqual(Object.keys(body.publicBmc), ['channels'])
  } finally {
    await app.close()
  }
})
