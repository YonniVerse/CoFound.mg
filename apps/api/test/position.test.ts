import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PositionService } from '../src/project/position.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

const input = { title: 'Responsable terrain', description: 'Coordonne les opérations.', expectedHours: 20, skillIds: ['s1', 's2'] }
const position = { id: 'pso1', projectId: 'p1', title: input.title, description: input.description, expectedHours: input.expectedHours, isOpen: true, skills: [{ skill: { id: 's1', labelKey: 'skill.project' } }, { skill: { id: 's2', labelKey: 'skill.team' } }] }

const owner = { id: 'm1' }

test('P-04 crée un poste et ses compétences dans une transaction', async () => {
  let transactionCalled = false
  let createArgs: unknown
  const prisma = { project: { findUnique: async () => ({ id: 'p1', members: [owner] }) }, $transaction: async (callback: (tx: unknown) => Promise<unknown>) => { transactionCalled = true; return callback({ skill: { findMany: async () => [{ id: 's1' }, { id: 's2' }] }, openPosition: { create: async (args: unknown) => { createArgs = args; return position } } }) } } as unknown as PrismaService
  const result = await new PositionService(prisma).create('u1', 'p1', input)
  assert.equal(transactionCalled, true)
  assert.equal(result.skills.length, 2)
  assert.deepEqual((createArgs as { data: { skills: { create: unknown[] } } }).data.skills.create, [{ skillId: 's1' }, { skillId: 's2' }])
})

test('P-04 refuse une compétence inactive ou inexistante', async () => {
  const prisma = { project: { findUnique: async () => ({ id: 'p1', members: [owner] }) }, $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback({ skill: { findMany: async () => [{ id: 's1' }] } }) } as unknown as PrismaService
  await assert.rejects(() => new PositionService(prisma).create('u1', 'p1', input), /inexistante ou inactive/)
})

test('P-04 ne permet pas de gérer les postes d’un autre projet', async () => {
  const prisma = { project: { findUnique: async () => ({ id: 'p2', members: [] }) } } as unknown as PrismaService
  await assert.rejects(() => new PositionService(prisma).update('u1', 'p1', 'pso1', { isOpen: false }), /Seul le propriétaire/)
})
