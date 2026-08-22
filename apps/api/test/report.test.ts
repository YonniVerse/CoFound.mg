import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { BadRequestException } from '@nestjs/common'
import { ReportService } from '../src/report/report.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

test('M-14 crée un signalement dans une transaction', async () => {
  let transactionUsed = false
  const prisma = {
    $transaction: async (callback: (tx: { report: { create: (args: unknown) => Promise<unknown> } }) => Promise<unknown>) => {
      transactionUsed = true
      return callback({ report: { create: async () => ({ id: 'report-1', targetType: 'PROFILE', targetId: 'talent-2', reason: 'SPAM', status: 'OPEN' }) } })
    },
  } as unknown as PrismaService
  const result = await new ReportService(prisma).create('user-1', { targetType: 'PROFILE', targetId: 'talent-2', reason: 'SPAM' })
  assert.deepEqual(result, { id: 'report-1', targetType: 'PROFILE', targetId: 'talent-2', reason: 'SPAM', status: 'OPEN' })
  assert.equal(transactionUsed, true)
})

test('M-14 refuse une cible ou une raison inconnue avant toute écriture', async () => {
  const prisma = { $transaction: async () => { throw new Error('ne doit pas écrire') } } as unknown as PrismaService
  await assert.rejects(() => new ReportService(prisma).create('user-1', { targetType: 'IDENTITY', targetId: 'x', reason: 'UNKNOWN' }), (error: unknown) => error instanceof BadRequestException)
})
