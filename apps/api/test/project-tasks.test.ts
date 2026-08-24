import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BadRequestException } from '@nestjs/common'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { ProjectTasksService } from '../src/project/project-tasks.service.js'

const member = { id: 'membership-1', projectId: 'project-1', userId: 'owner-1', role: 'OWNER', leftAt: null }
const task = { id: 'task-1', projectId: 'project-1', title: 'Préparer la démo', description: null, assigneeId: 'talent-1', dueDate: null, status: 'TODO', createdAt: new Date(), updatedAt: new Date(), assignee: { id: 'talent-1', talentProfile: { pseudonym: 'Talent-Delta' } } }

test('P-09 liste les tâches uniquement pour un membre actif et masque l’identité civile', async () => {
  const prisma = { projectMember: { findFirst: async () => member }, task: { findMany: async () => [task] } } as unknown as PrismaService
  const response = await new ProjectTasksService(prisma).list('project-1', 'owner-1')
  assert.equal(response.tasks[0]?.assigneePseudonym, 'Talent-Delta')
  assert.equal('assigneeName' in (response.tasks[0] ?? {}), false)
})

test('P-09 crée une tâche dans une transaction et refuse un responsable hors équipe', async () => {
  let transactionCalled = false
  const prisma = {
    projectMember: { findFirst: async () => member },
    $transaction: async (callback: (transaction: { projectMember: { findFirst: () => Promise<null> }; task: { create: (args: unknown) => Promise<typeof task> } }) => Promise<typeof task>) => {
      transactionCalled = true
      return callback({ projectMember: { findFirst: async () => null }, task: { create: async () => task } })
    },
  } as unknown as PrismaService
  await assert.rejects(() => new ProjectTasksService(prisma).create('project-1', 'owner-1', { title: 'Démo', description: null, assigneeId: 'outsider', dueDate: null }), (error: unknown) => error instanceof BadRequestException)
  assert.equal(transactionCalled, true)
})

test('P-09 supprime une tâche dans une transaction', async () => {
  let deleted = false
  const prisma = {
    projectMember: { findFirst: async () => member },
    $transaction: async (callback: (transaction: { task: { findFirst: () => Promise<typeof task>; delete: () => Promise<typeof task> } }) => Promise<unknown>) => callback({ task: { findFirst: async () => task, delete: async () => { deleted = true; return task } } }),
  } as unknown as PrismaService
  const response = await new ProjectTasksService(prisma).remove('project-1', 'task-1', 'owner-1')
  assert.deepEqual(response, { deleted: true, id: 'task-1' })
  assert.equal(deleted, true)
})
