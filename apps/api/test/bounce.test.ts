import { strict as assert } from 'node:assert'
import { createHmac } from 'node:crypto'
import { test } from 'node:test'
import { BounceService } from '../src/import/bounce.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

test('E-03 vérifie la signature HMAC du webhook', () => {
  const secret = 'a'.repeat(32)
  const body = JSON.stringify({ event: 'email.bounced', email: 'fara@example.mg' })
  const signature = createHmac('sha256', secret).update(body).digest('hex')
  const previousSecret = process.env.EMAIL_WEBHOOK_SECRET
  process.env.EMAIL_WEBHOOK_SECRET = secret
  const service = new BounceService({} as PrismaService)

  service.verifySignature(body, signature)
  assert.throws(() => service.verifySignature(body, 'bad'), /invalide/)
  if (previousSecret === undefined) delete process.env.EMAIL_WEBHOOK_SECRET
  else process.env.EMAIL_WEBHOOK_SECRET = previousSecret
})

test('E-03 marque un email comme BOUNCED de manière idempotente', async () => {
  let query: unknown
  const prisma = {
    importRow: {
      updateMany: async (input: unknown) => { query = input; return { count: 1 } },
    },
  } as unknown as PrismaService
  const service = new BounceService(prisma)

  const result = await service.markBounced({ event: 'email.bounced', email: 'FARA@EXAMPLE.MG', batchId: 'batch-1', providerMessageId: 'provider-1' })

  assert.deepEqual(result, { updatedRows: 1 })
  assert.deepEqual(query, {
    where: { normalizedEmail: 'fara@example.mg', result: { not: 'BOUNCED' }, batchId: 'batch-1' },
    data: { result: 'BOUNCED', errorCode: 'BOUNCED:provider-1' },
  })
})
