import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { PersonalDataExportService } from '../src/privacy/personal-data-export.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

test('S-06 réutilise un export actif pour rendre la demande idempotente', async () => {
  const existing = { id: 'export-1', userId: 'user-1', status: 'PENDING' as const, storageKey: null, requestedAt: new Date(), completedAt: null, expiresAt: null }
  const prisma = {
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback({ personalDataExport: { findFirst: async () => existing, create: async () => { throw new Error('ne doit pas créer') } } }),
  } as unknown as PrismaService
  const audit = { record: async () => undefined }
  const queue = { enqueue: async () => 'job-1' }
  const result = await new PersonalDataExportService(prisma, audit as never, queue as never).request('user-1', { confirmation: true })
  assert.equal(result.export.id, 'export-1')
  assert.equal(result.export.downloadAvailable, false)
})

test('S-06 refuse une demande sans confirmation explicite', async () => {
  const prisma = {} as PrismaService
  const audit = { record: async () => undefined }
  const queue = { enqueue: async () => 'job-1' }
  await assert.rejects(() => new PersonalDataExportService(prisma, audit as never, queue as never).request('user-1', { confirmation: false as never }))
})

test('S-06 ne permet pas de lire l’export d’un autre utilisateur', async () => {
  const prisma = { personalDataExport: { findFirst: async () => null } } as unknown as PrismaService
  const audit = { record: async () => undefined }
  const queue = { enqueue: async () => 'job-1' }
  await assert.rejects(() => new PersonalDataExportService(prisma, audit as never, queue as never).status('user-1', 'export-other'))
})
