import 'reflect-metadata'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ProjectTasksController } from '../src/project/project-tasks.controller.js'
import { ProjectTasksService } from '../src/project/project-tasks.service.js'

async function startTestApp() {
  const calls: Array<{ method: string; args: unknown[] }> = []
  const service: Pick<ProjectTasksService, 'list' | 'create' | 'update' | 'remove'> = {
    list: async (...args) => { calls.push({ method: 'list', args }); return { projectId: 'project-1', tasks: [] } },
    create: async (...args) => { calls.push({ method: 'create', args }); return { id: 'task-1' } as never },
    update: async (...args) => { calls.push({ method: 'update', args }); return { id: 'task-1', status: 'DOING' } as never },
    remove: async (...args) => { calls.push({ method: 'remove', args }); return { deleted: true, id: 'task-1' } },
  }
  @Module({ controllers: [ProjectTasksController], providers: [{ provide: ProjectTasksService, useValue: service }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: ['error'] })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'owner-1' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  return { app, calls }
}

test('P-09 expose le CRUD des tâches par HTTP', async () => {
  const { app, calls } = await startTestApp()
  try {
    const baseUrl = await app.getUrl()
    const headers = { authorization: 'Bearer test-token', 'content-type': 'application/json' }
    const list = await fetch(`${baseUrl}/api/v1/projects/project-1/tasks`, { headers })
    assert.equal(list.status, 200, await list.text())
    const create = await fetch(`${baseUrl}/api/v1/projects/project-1/tasks`, { method: 'POST', headers, body: JSON.stringify({ title: 'Préparer la démo', status: 'TODO' }) })
    assert.equal(create.status, 201, await create.text())
    const update = await fetch(`${baseUrl}/api/v1/projects/project-1/tasks/task-1`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'DOING' }) })
    assert.equal(update.status, 200, await update.text())
    const remove = await fetch(`${baseUrl}/api/v1/projects/project-1/tasks/task-1`, { method: 'DELETE', headers })
    assert.equal(remove.status, 200, await remove.text())
    assert.deepEqual(calls.map(({ method }) => method), ['list', 'create', 'update', 'remove'])
    assert.deepEqual(calls[1]?.args.slice(0, 2), ['project-1', 'owner-1'])
  } finally {
    await app.close()
  }
})

test('P-09 rejette une tâche sans titre au niveau HTTP', async () => {
  const { app } = await startTestApp()
  try {
    const baseUrl = await app.getUrl()
    const response = await fetch(`${baseUrl}/api/v1/projects/project-1/tasks`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'TODO' }) })
    assert.equal(response.status, 400)
  } finally {
    await app.close()
  }
})
