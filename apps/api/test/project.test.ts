import assert from 'node:assert/strict'
import { test } from 'node:test'
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

test('P-01 refuse la consultation d’un projet dont l’utilisateur n’est pas membre', async () => {
  const prisma = { project: { findUnique: async () => ({ ...project, members: [{ userId: 'other', role: 'OWNER' }] }) } } as unknown as PrismaService
  await assert.rejects(() => new ProjectService(prisma).getById('u1', 'p1'), /Accès au projet refusé/)
})

test('P-01 expose PROJECT_CREATE et PROJECT_READ sur les routes attendues', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProjectController.prototype.create), [Permission.PROJECT_CREATE])
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProjectController.prototype.getById), [Permission.PROJECT_READ])
})
