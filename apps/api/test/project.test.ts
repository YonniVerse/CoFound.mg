import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BMC_BLOCK_KEYS } from '@cofound/shared'
import { ProjectController } from '../src/project/project.controller.js'
import { ProjectService } from '../src/project/project.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { Permission } from '../src/rbac/permissions.js'

const project = {
  id: 'p1',
  title: 'Projet test',
  pitch: 'Une proposition de valeur suffisamment longue.',
  status: 'DRAFT',
  sectorId: null,
  regionId: null,
  createdById: 'u1',
  createdAt: new Date(),
  updatedAt: new Date(),
  members: [{ userId: 'u1', role: 'OWNER' }],
}

test('P-01 crée un projet DRAFT et ajoute le créateur comme OWNER dans une transaction', async () => {
  let transactionCalled = false
  let createData: unknown
  const prisma = {
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
      transactionCalled = true
      return callback({ project: { create: async (args: { data: unknown }) => { createData = args.data; return project } } })
    },
  } as unknown as PrismaService
  const result = await new ProjectService(prisma).create('u1', { title: 'Projet test', pitch: 'Une proposition de valeur suffisamment longue.' })
  assert.equal(transactionCalled, true)
  assert.equal(result.status, 'DRAFT')
  assert.deepEqual(createData, {
    title: 'Projet test',
    pitch: 'Une proposition de valeur suffisamment longue.',
    sectorId: null,
    regionId: null,
    createdById: 'u1',
    status: 'DRAFT',
    members: { create: { userId: 'u1', role: 'OWNER' } },
  })
})

test('P-01 retourne les projets possédés pour le compositeur du feed', async () => {
  const createdAt = new Date('2026-08-20T10:00:00Z')
  const prisma = {
    project: {
      findMany: async () => [{ id: 'p1', title: 'Projet test', pitch: 'Un pitch', status: 'DRAFT', createdAt }],
    },
  } as unknown as PrismaService

  const result = await new ProjectService(prisma).getMine('u1')

  assert.deepEqual(result.projects, [{ id: 'p1', title: 'Projet test', pitch: 'Un pitch', status: 'DRAFT', createdAt }])
})

test('P-01 refuse la consultation d’un projet dont l’utilisateur n’est pas membre', async () => {
  const prisma = { project: { findUnique: async () => ({ ...project, members: [{ userId: 'other', role: 'OWNER' }] }) } } as unknown as PrismaService
  await assert.rejects(() => new ProjectService(prisma).getById('u1', 'p1'), /Accès au projet refusé/)
})

test('P-01 expose PROJECT_CREATE et PROJECT_READ sur les routes attendues', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProjectController.prototype.create), [Permission.PROJECT_CREATE])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProjectController.prototype.getMine), [Permission.PROJECT_READ])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProjectController.prototype.getById), [Permission.PROJECT_READ])
})


test('P-03 refuse la publication et retourne les blocs BMC manquants', async () => {
  const prisma = {
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback({ project: { findUnique: async () => ({ id: 'p1', status: 'DRAFT', members: [{ role: 'OWNER' }], canvas: { blocks: { customerSegments: { content: 'Clients' } } } }) } }),
  } as unknown as PrismaService
  const response = await new ProjectService(prisma).publish('u1', 'p1')
  assert.equal(response.published, false)
  assert.equal(response.missingBlocks.length, 8)
  assert.ok(response.missingBlocks.includes('costStructure'))
})

test('P-03 passe un projet complet de DRAFT à RECRUITING dans une transaction', async () => {
  const blocks = Object.fromEntries(BMC_BLOCK_KEYS.map((key) => [key, { content: key }]))
  let updateCalled = false
  const prisma = {
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback({ project: { findUnique: async () => ({ id: 'p1', status: 'DRAFT', members: [{ role: 'OWNER' }], canvas: { blocks } }), update: async () => { updateCalled = true; return { id: 'p1', status: 'RECRUITING', publishedAt: new Date() } } } }),
  } as unknown as PrismaService
  const response = await new ProjectService(prisma).publish('u1', 'p1')
  assert.equal(updateCalled, true)
  assert.equal(response.published, true)
  assert.equal(response.status, 'RECRUITING')
})

test('P-03 expose la transition avec PROJECT_MANAGE', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProjectController.prototype.publish), [Permission.PROJECT_MANAGE])
})
