import 'reflect-metadata'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ProjectMembersController } from '../src/project/project-members.controller.js'
import { ProjectMembersService } from '../src/project/project-members.service.js'

async function startTestApp() {
  const calls: Array<{ method: string; args: unknown[] }> = []
  const service: Pick<ProjectMembersService, 'list' | 'add' | 'updateRole' | 'leave'> = {
    list: async (...args) => { calls.push({ method: 'list', args }); return { items: [] } },
    add: async (...args) => { calls.push({ method: 'add', args }); return { id: 'member-1' } as never },
    updateRole: async (...args) => { calls.push({ method: 'updateRole', args }); return { id: 'member-1', role: 'MENTOR' } as never },
    leave: async (...args) => { calls.push({ method: 'leave', args }); return { id: 'member-1', leftAt: new Date() } as never },
  }
  @Module({ controllers: [ProjectMembersController], providers: [{ provide: ProjectMembersService, useValue: service }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: ['error'] })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'owner-1' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0, '127.0.0.1')
  return { app, calls }
}

test('P-08 expose les mutations membres du projet par HTTP', async () => {
  const { app, calls } = await startTestApp()
  try {
    const baseUrl = await app.getUrl()
    const headers = { authorization: 'Bearer test-token', 'content-type': 'application/json' }
    const list = await fetch(`${baseUrl}/api/v1/projects/project-1/members`, { headers })
    const listRaw = await list.text()
    assert.equal(list.status, 200, listRaw)
    assert.deepEqual(calls[0], { method: 'list', args: ['project-1', 'owner-1'] })

    const add = await fetch(`${baseUrl}/api/v1/projects/project-1/members`, { method: 'POST', headers, body: JSON.stringify({ userId: 'talent-2', role: 'MEMBER' }) })
    assert.equal(add.status, 201, await add.text())
    assert.deepEqual(calls[1], { method: 'add', args: ['project-1', 'owner-1', 'talent-2', 'MEMBER'] })

    const update = await fetch(`${baseUrl}/api/v1/projects/project-1/members/member-1/role`, { method: 'PATCH', headers, body: JSON.stringify({ role: 'MENTOR' }) })
    assert.equal(update.status, 200, await update.text())
    assert.deepEqual(calls[2], { method: 'updateRole', args: ['project-1', 'owner-1', 'member-1', 'MENTOR'] })

    const leave = await fetch(`${baseUrl}/api/v1/projects/project-1/members/me`, { method: 'DELETE', headers })
    assert.equal(leave.status, 200, await leave.text())
    assert.deepEqual(calls[3], { method: 'leave', args: ['project-1', 'owner-1'] })
  } finally {
    await app.close()
  }
})

test('P-08 rejette un rôle invalide au niveau HTTP', async () => {
  const { app } = await startTestApp()
  try {
    const baseUrl = await app.getUrl()
    const response = await fetch(`${baseUrl}/api/v1/projects/project-1/members/member-1/role`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ role: 'ADMIN' }) })
    assert.equal(response.status, 400)
  } finally {
    await app.close()
  }
})
