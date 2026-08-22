import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ApplicationsService } from '../src/applications/applications.service.js'
import { ConnectionService } from '../src/connection/connection.service.js'
import { MessagingService } from '../src/messaging/messaging.service.js'
import { ReportService } from '../src/report/report.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

type NotificationCall = { userId: string; recipient: string; type: string; referenceId: string; payload: Record<string, unknown>; displayName: string; locale?: string }

type NotificationSpy = { calls: NotificationCall[]; notifyBusinessEvent: (input: NotificationCall) => Promise<void> }
function notificationSpy(): NotificationSpy {
  const calls: NotificationCall[] = []
  return { calls, notifyBusinessEvent: async (input) => { calls.push(input) } }
}

test('notification métier : une connexion acceptée notifie l’initiateur de la demande', async () => {
  const notifications = notificationSpy()
  const prisma = {
    connectionRequest: { findUnique: async () => ({ id: 'request-1', fromUserId: 'sender-1', toUserId: 'receiver-1', status: 'PENDING' }), update: async () => ({}) },
    connection: { upsert: async () => ({ id: 'connection-1' }) },
    $transaction: async <T>(callback: (tx: typeof prisma) => Promise<T>) => callback(prisma),
    user: { findUnique: async () => ({ email: 'sender@example.test', locale: 'fr', talentProfile: { pseudonym: 'Talent-42' } }) },
  } as unknown as PrismaService
  const service = new ConnectionService(prisma, notifications as never)

  await service.acceptRequest('receiver-1', 'request-1')

  assert.equal(notifications.calls.length, 1)
  assert.deepEqual(notifications.calls[0], {
    userId: 'sender-1', recipient: 'sender@example.test', type: 'connection.accepted', referenceId: 'connection-1',
    displayName: 'Talent-42', payload: { connectionId: 'connection-1' }, locale: 'fr',
  })
})

test('notification métier : un nouveau message notifie les autres participants uniquement', async () => {
  const notifications = notificationSpy()
  const prisma = {
    conversationParticipant: {
      findUnique: async () => ({ conversationId: 'conversation-1', userId: 'author-1' }),
      findMany: async () => [{ user: { id: 'recipient-1', email: 'recipient@example.test', locale: 'mg', talentProfile: { pseudonym: 'Membre-7' } } }],
    },
    message: { create: async () => ({ id: 'message-1', conversationId: 'conversation-1', authorId: 'author-1', body: 'Bonjour', author: { talentProfile: { pseudonym: 'Auteur-1' } } }) },
  } as unknown as PrismaService
  const service = new MessagingService(prisma, notifications as never)

  await service.send('author-1', 'conversation-1', { body: 'Bonjour' })

  assert.equal(notifications.calls.length, 1)
  assert.equal(notifications.calls[0]?.userId, 'recipient-1')
  assert.equal(notifications.calls[0]?.type, 'message.received')
  assert.equal(notifications.calls[0]?.referenceId, 'message-1')
  assert.deepEqual(notifications.calls[0]?.payload, { conversationId: 'conversation-1', messageId: 'message-1' })
  assert.equal(notifications.calls[0]?.locale, 'mg')
})

test('notification métier : l’acceptation d’une candidature notifie le candidat', async () => {
  const notifications = notificationSpy()
  const application = {
    id: 'application-1', projectId: 'project-1', positionId: null, applicantId: 'candidate-1', message: 'Je souhaite rejoindre le projet.', status: 'PENDING', rejectionReason: null, decidedAt: null, createdAt: new Date(), updatedAt: new Date(),
    project: { id: 'project-1', title: 'Projet', pitch: 'Pitch', status: 'RECRUITING', createdById: 'owner-1' }, position: null,
    applicant: { talentProfile: { pseudonym: 'Candidat-9', avatarSeed: 'seed', headline: 'Développeur' } },
  }
  const prisma = {
    project: { findUnique: async () => ({ id: 'project-1', createdById: 'owner-1' }) },
    application: {
      findUnique: async () => application,
      updateMany: async () => { application.status = 'ACCEPTED'; return { count: 1 } },
      findUniqueOrThrow: async () => application,
    },
    $transaction: async <T>(callback: (tx: typeof prisma) => Promise<T>) => callback(prisma),
    user: { findUnique: async () => ({ id: 'candidate-1', email: 'candidate@example.test', locale: 'fr', talentProfile: { pseudonym: 'Candidat-9' } }) },
  } as unknown as PrismaService
  const service = new ApplicationsService(prisma, notifications as never)

  await service.accept('owner-1', 'application-1')

  assert.equal(notifications.calls.length, 1)
  assert.equal(notifications.calls[0]?.userId, 'candidate-1')
  assert.equal(notifications.calls[0]?.type, 'application.accepted')
  assert.deepEqual(notifications.calls[0]?.payload, { applicationId: 'application-1', projectId: 'project-1' })
})

test('notification métier : la résolution d’un signalement notifie son déclarant', async () => {
  const notifications = notificationSpy()
  const report = { id: 'report-1', reporterId: 'reporter-1', status: 'OPEN', targetType: 'MESSAGE', targetId: 'message-1' }
  const prisma = {
    report: {
      findUnique: async () => report,
      update: async () => ({ ...report, status: 'RESOLVED' }),
    },
    $transaction: async <T>(callback: (tx: typeof prisma) => Promise<T>) => callback(prisma),
    user: { findUnique: async () => ({ id: 'reporter-1', email: 'reporter@example.test', locale: 'fr', talentProfile: { pseudonym: 'Signaleur-3' } }) },
  } as unknown as PrismaService
  const service = new ReportService(prisma, notifications as never)

  await service.resolve('moderator-1', 'report-1', { status: 'RESOLVED' })

  assert.equal(notifications.calls.length, 1)
  assert.equal(notifications.calls[0]?.userId, 'reporter-1')
  assert.equal(notifications.calls[0]?.type, 'report.resolved')
  assert.deepEqual(notifications.calls[0]?.payload, { reportId: 'report-1', status: 'RESOLVED' })
})
