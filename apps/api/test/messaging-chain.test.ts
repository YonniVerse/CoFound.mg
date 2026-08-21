/* eslint-disable @typescript-eslint/no-explicit-any -- doubles Prisma minimaux pour les tests unitaires */
import assert from 'node:assert/strict'
import test from 'node:test'
import { ConnectionRequestService } from '../src/connection/connection-request.service.js'
import { ConnectionService } from '../src/connection/connection.service.js'
import { MessagingService } from '../src/messaging/messaging.service.js'

const tx = (connectionRequest: any, connection: any = {}, conversation: any = {}, participant: any = {}, message: any = {}) => ({
  connectionRequest, connection, conversation, conversationParticipant: participant, message,
})

test('M-09 retourne la demande pending existante sans consommer le quota', async () => {
  let creates = 0
  const existing = { id: 'req-1', status: 'PENDING' }
  const prisma: any = { $transaction: async (fn: any) => fn(tx({ findFirst: async () => existing, count: async () => 5, create: async () => { creates++; return {} } })) }
  const result = await new ConnectionRequestService(prisma).create('u1', { toUserId: 'u2', message: 'Bonjour' })
  assert.equal(result, existing)
  assert.equal(creates, 0)
})

test('M-10 normalise la paire et réutilise la connexion idempotente', async () => {
  let upserts = 0
  const prisma: any = { $transaction: async (fn: any) => fn(tx({ findUnique: async () => ({ id: 'r', fromUserId: 'z', toUserId: 'a', status: 'PENDING' }), update: async () => ({}) }, { upsert: async (args: any) => { upserts++; assert.deepEqual(args.where, { userAId_userBId: { userAId: 'a', userBId: 'z' } }); return { id: 'c' } } })) }
  await new ConnectionService(prisma).acceptRequest('a', 'r')
  assert.equal(upserts, 1)
})

test('M-11 refuse toute lecture de conversation hors participant', async () => {
  const prisma: any = { conversationParticipant: { findUnique: async () => null } }
  await assert.rejects(() => new MessagingService(prisma).messages('intrus', 'conv'), (error: any) => error?.response?.code === 'CONVERSATION_ACCESS_DENIED')
})

test('M-09 délègue ACCEPTED au workflow M-10 unique', async () => {
  const { ConnectionRequestController } = await import('../src/connection/connection-request.controller.js')
  let accepted = 0
  const controller = new ConnectionRequestController(
    { decide: async () => { throw new Error('ne doit pas être appelé') } } as any,
    { acceptRequest: async () => { accepted++; return { id: 'connection-1' } } } as any,
  )
  const result = await controller.decide({ user: { userId: 'recipient' } } as any, 'request-1', { decision: 'ACCEPTED' })
  assert.deepEqual(result, { id: 'connection-1' })
  assert.equal(accepted, 1)
})

test('M-11 relit la conversation gagnante après une collision concurrente', async () => {
  const { Prisma } = await import('@prisma/client')
  const uniqueError = new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 'test' })
  const prisma: any = {
    $transaction: async () => { throw uniqueError },
    connection: { findUnique: async () => ({ conversationId: 'conv-winner', userAId: 'a', userBId: 'b' }) },
    conversation: { findUnique: async ({ where }: any) => ({ id: where.id }) },
  }
  const result = await new MessagingService(prisma).openDirect('a', 'connection-1')
  assert.deepEqual(result, { id: 'conv-winner' })
})
