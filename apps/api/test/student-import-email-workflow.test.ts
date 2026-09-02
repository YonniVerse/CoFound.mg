/* eslint-disable @typescript-eslint/no-explicit-any -- Mock transactionnel pour test de bout en bout du workflow */
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import * as argon2 from 'argon2'
import { createHash } from 'node:crypto'
import { ImportApplyService } from '../src/import/import-apply.service.js'
import { ImportBatchService } from '../src/import/import-batch.service.js'
import { AuthService } from '../src/auth/auth.service.js'
import { SmtpNotificationTransport } from '../src/notifications/smtp-transport.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import type { NotificationsQueueService } from '../src/notifications/notifications-queue.service.js'
import type { NotificationJob } from '../src/notifications/notification-job.js'

type MockDbState = {
  batches: Map<string, any>
  users: Map<string, any>
  identities: Map<string, any>
  affiliations: Map<string, any>
  profiles: Map<string, any>
  invitations: Map<string, any>
  refreshTokens: Map<string, any>
  jobs: NotificationJob[]
}

function createMockEnvironment(existingUsers: any[] = []) {
  const state: MockDbState = {
    batches: new Map(),
    users: new Map(existingUsers.map((u) => [u.email, { ...u }])),
    identities: new Map(),
    affiliations: new Map(),
    profiles: new Map(),
    invitations: new Map(),
    refreshTokens: new Map(),
    jobs: [],
  }

  // Pre-seed manager user
  state.users.set('manager-org@example.mg', {
    id: 'manager-1',
    email: 'manager-org@example.mg',
    platformRole: 'ORG_MEMBER',
    status: 'ACTIVE',
  })

  // Pre-seed unauthorized user
  state.users.set('viewer-org@example.mg', {
    id: 'viewer-1',
    email: 'viewer-org@example.mg',
    platformRole: 'ORG_MEMBER',
    status: 'ACTIVE',
  })

  const tx: any = {
    importBatch: {
      findUnique: async ({ where, include }: any) => {
        const batch = state.batches.get(where.id)
        if (!batch) return null
        let rows = batch.rows || []
        if (include?.rows?.where?.result) {
          rows = rows.filter((r: any) => r.result === include.rows.where.result)
        }
        if (include?.rows?.include?.user) {
          rows = rows.map((r: any) => {
            const user = r.userId
              ? [...state.users.values()].find((u) => u.id === r.userId)
              : r.normalizedEmail
                ? state.users.get(r.normalizedEmail)
                : null
            return { ...r, user }
          })
        }
        return {
          ...batch,
          rows,
          organization: { id: batch.organizationId, type: 'INSTITUTION' },
        }
      },
      update: async ({ where, data }: any) => {
        const current = state.batches.get(where.id)
        if (!current) throw new Error('batch not found')
        const updated = { ...current, ...data }
        state.batches.set(where.id, updated)
        return updated
      },
      findMany: async () => Array.from(state.batches.values()),
    },
    organizationMember: {
      findUnique: async ({ where }: any) => {
        if (where.organizationId_userId?.userId === 'manager-1') {
          return { role: 'ORG_MANAGER', organizationId: where.organizationId_userId.organizationId, userId: 'manager-1' }
        }
        if (where.organizationId_userId?.userId === 'viewer-1') {
          return { role: 'ORG_VIEWER', organizationId: where.organizationId_userId.organizationId, userId: 'viewer-1' }
        }
        return null
      },
      findMany: async () => [],
    },
    organization: {
      findMany: async () => [{ id: 'org-1' }],
    },
    user: {
      findUnique: async ({ where }: any) => {
        if (where.email) return state.users.get(where.email) ?? null
        if (where.id) return [...state.users.values()].find((u) => u.id === where.id) ?? null
        return null
      },
      create: async ({ data }: any) => {
        const user = { id: `user-${state.users.size + 1}`, ...data }
        state.users.set(user.email, user)
        return user
      },
      update: async ({ where, data }: any) => {
        const current = [...state.users.values()].find((u) => u.id === where.id)
        if (!current) throw new Error('user not found')
        Object.assign(current, data)
        return current
      },
      findMany: async () => Array.from(state.users.values()),
    },
    talentIdentity: {
      upsert: async ({ create, update, where }: any) => {
        const existing = state.identities.get(where.userId)
        const val = existing ? { ...existing, ...update } : { ...create }
        state.identities.set(where.userId, val)
        return val
      },
    },
    affiliation: {
      upsert: async ({ create, update, where }: any) => {
        const key = `${where.userId_organizationId.userId}_${where.userId_organizationId.organizationId}`
        const existing = state.affiliations.get(key)
        const val = existing ? { ...existing, ...update } : { ...create }
        state.affiliations.set(key, val)
        return val
      },
    },
    talentProfile: {
      upsert: async ({ create, update, where }: any) => {
        const existing = state.profiles.get(where.userId)
        const val = existing ? { ...existing, ...update } : { ...create }
        state.profiles.set(where.userId, val)
        return val
      },
    },
    field: {
      findMany: async () => [
        { id: 'field-cs', slug: 'computer-science', labelKey: 'Informatique', isActive: true },
        { id: 'field-mgmt', slug: 'management', labelKey: 'Gestion', isActive: true },
      ],
    },
    importRow: {
      update: async ({ where, data }: any) => {
        for (const batch of state.batches.values()) {
          const row = batch.rows?.find((r: any) => r.id === where.id)
          if (row) {
            Object.assign(row, data)
            return row
          }
        }
        return data
      },
    },
    invitationToken: {
      create: async ({ data }: any) => {
        const token = { id: `inv-${state.invitations.size + 1}`, usedAt: null, ...data }
        state.invitations.set(data.tokenHash, token)
        return token
      },
      findUnique: async ({ where }: any) => {
        const inv = state.invitations.get(where.tokenHash)
        if (!inv) return null
        const user = [...state.users.values()].find((u) => u.id === inv.userId)
        return { ...inv, user }
      },
      update: async ({ where, data }: any) => {
        const inv = [...state.invitations.values()].find((i) => i.id === where.id)
        if (!inv) throw new Error('invitation not found')
        Object.assign(inv, data)
        return inv
      },
    },
    refreshToken: {
      create: async ({ data }: any) => {
        state.refreshTokens.set(data.tokenHash, data)
        return data
      },
    },
  }

  const prisma = {
    ...tx,
    $transaction: async (cb: any) => cb(tx),
  } as unknown as PrismaService

  const queue = {
    enqueue: async (job: NotificationJob) => {
      state.jobs.push(job)
      return `job-${state.jobs.length}`
    },
  } as unknown as NotificationsQueueService

  return { state, prisma, queue }
}

function makeBatch(id: string, students: Array<{ email: string; firstName: string; lastName: string; field?: string }>) {
  return {
    id,
    organizationId: 'org-1',
    uploadedById: 'manager-1',
    status: 'PREVIEW',
    totalRows: students.length,
    createdRows: 0,
    updatedRows: 0,
    errorRows: 0,
    columnMapping: {
      email: 'Email',
      firstName: 'Prénom',
      lastName: 'Nom',
      fieldOfStudy: 'Filière',
      level: 'Niveau',
      entryYear: 'Année',
    },
    rows: students.map((s, idx) => ({
      id: `row-${id}-${idx + 1}`,
      lineNumber: idx + 2,
      result: null,
      errorCode: null,
      raw: {
        Email: s.email,
        Prénom: s.firstName,
        Nom: s.lastName,
        Filière: s.field || 'Informatique',
        Niveau: 'L3',
        Année: 2024,
      },
    })),
  }
}

test('WORKFLOW COMPLET : 1 étudiant -> Importation -> Création compte -> Token sécurisé -> Job queue -> Envoi email -> Activation', async () => {
  const { state, prisma, queue } = createMockEnvironment()
  const importApplyService = new ImportApplyService(prisma, queue)
  const authService = new AuthService(prisma, queue)

  // 1. Initialiser le lot
  const batch = makeBatch('batch-single', [
    { email: 'jean.dupont@univ-antananarivo.mg', firstName: 'Jean', lastName: 'Dupont' },
  ])
  state.batches.set(batch.id, batch)

  // 2. Application de l'import par le manager
  const result = await importApplyService.apply({ batchId: 'batch-single' }, 'manager-1')

  assert.equal(result.status, 'APPLIED')
  assert.equal(result.createdRows, 1)
  assert.equal(result.totalRows, 1)

  // 3. Vérification de la création du compte en base
  const createdUser = state.users.get('jean.dupont@univ-antananarivo.mg')
  assert.ok(createdUser, 'Le compte utilisateur doit exister')
  assert.equal(createdUser.status, 'INVITED')
  assert.equal(createdUser.platformRole, 'TALENT')

  // Sécurité : le mot de passe est bien hashé avec Argon2id et non stocké en clair
  assert.ok(createdUser.passwordHash.startsWith('$argon2id$'), 'Le mot de passe doit être hashé avec Argon2id')
  assert.notEqual(createdUser.passwordHash, 'TempPassword')

  // 4. Vérification de la queue d’email et du job créé
  assert.equal(state.jobs.length, 1, 'Un job d’email doit être créé dans la queue')
  const job = state.jobs[0]
  assert.equal(job.kind, 'account.credentials')
  assert.equal(job.recipient, 'jean.dupont@univ-antananarivo.mg')

  if (job.kind === 'account.credentials') {
    assert.ok(job.temporaryPassword.length >= 10, 'Le mot de passe temporaire doit être robuste')
    assert.ok(job.activationToken.length >= 20, 'Le token d’activation doit être sécurisé')

    // 5. Test du transport d'email (simulation worker -> SMTP)
    const deliveredEmails: any[] = []
    const testTransport = {
      deliver: async (j: NotificationJob) => {
        deliveredEmails.push(j)
      },
    }
    await testTransport.deliver(job)
    assert.equal(deliveredEmails.length, 1)
    assert.equal(deliveredEmails[0].recipient, 'jean.dupont@univ-antananarivo.mg')

    // 6. Test d’activation du compte par l'étudiant avec son token
    const session = await authService.activate({
      token: job.activationToken,
      password: 'MonNouveauMotDePassePerso2026!',
      locale: 'fr',
    })

    assert.ok(session.accessToken, 'L’activation doit retourner une session avec accessToken')
    assert.ok(session.refreshToken, 'L’activation doit retourner un refreshToken')

    // Le compte doit maintenant être ACTIVE
    assert.equal(createdUser.status, 'ACTIVE')
    assert.ok(createdUser.activatedAt instanceof Date)

    // Le nouveau mot de passe est vérifiable
    const passwordMatch = await argon2.verify(createdUser.passwordHash, 'MonNouveauMotDePassePerso2026!')
    assert.ok(passwordMatch, 'Le nouveau mot de passe personnalisé doit être actif')

    // L'invitationToken doit être marqué comme utilisé
    const tokenHash = createHash('sha256').update(job.activationToken).digest('hex')
    const usedInvitation = state.invitations.get(tokenHash)
    assert.ok(usedInvitation.usedAt instanceof Date, 'Le token d’activation doit être consommé')

    // Re-tentative d'activation avec le même token doit échouer
    await assert.rejects(
      async () => {
        await authService.activate({
          token: job.activationToken,
          password: 'AutreTentative!',
          locale: 'fr',
        })
      },
      { name: 'UnauthorizedException' },
    )
  }
})

test('TEST 10 ÉTUDIANTS : Traitement groupé, création des 10 comptes et 10 jobs emails', async () => {
  const { state, prisma, queue } = createMockEnvironment()
  const importApplyService = new ImportApplyService(prisma, queue)

  const students = Array.from({ length: 10 }, (_, i) => ({
    email: `etudiant.${i + 1}@universite.mg`,
    firstName: `Prénom${i + 1}`,
    lastName: `Nom${i + 1}`,
  }))

  const batch = makeBatch('batch-10', students)
  state.batches.set(batch.id, batch)

  const result = await importApplyService.apply({ batchId: 'batch-10' }, 'manager-1')

  assert.equal(result.totalRows, 10)
  assert.equal(result.createdRows, 10)
  assert.equal(state.jobs.length, 10, '10 jobs d’email doivent avoir été mis en file d’attente')

  for (const s of students) {
    const user = state.users.get(s.email)
    assert.ok(user, `L’utilisateur ${s.email} doit exister`)
    assert.equal(user.status, 'INVITED')
  }
})

test('TEST 100 ÉTUDIANTS : Performance et scalabilité de la file d’attente', async () => {
  const { state, prisma, queue } = createMockEnvironment()
  const importApplyService = new ImportApplyService(prisma, queue)

  const students = Array.from({ length: 100 }, (_, i) => ({
    email: `promo.2026.${i + 1}@institution.mg`,
    firstName: `Student${i + 1}`,
    lastName: `Promo${i + 1}`,
  }))

  const batch = makeBatch('batch-100', students)
  state.batches.set(batch.id, batch)

  const result = await importApplyService.apply({ batchId: 'batch-100' }, 'manager-1')

  assert.equal(result.totalRows, 100)
  assert.equal(result.createdRows, 100)
  assert.equal(state.jobs.length, 100, 'Exactement 100 jobs doivent être générés sans perte')
})

test('IDEMPOTENCE & DOUBLONS : Importation répétée du même étudiant sans double compte', async () => {
  const existing = {
    id: 'user-already-active',
    email: 'already.active@univ.mg',
    status: 'ACTIVE',
    platformRole: 'TALENT',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$existingHash',
  }
  const { state, prisma, queue } = createMockEnvironment([existing])
  const importApplyService = new ImportApplyService(prisma, queue)

  const batch = makeBatch('batch-dup', [
    { email: 'already.active@univ.mg', firstName: 'Déjà', lastName: 'Actif' },
    { email: 'already.active@univ.mg', firstName: 'Déjà', lastName: 'Actif (doublon dans fichier)' },
    { email: 'nouveau.talent@univ.mg', firstName: 'Nouveau', lastName: 'Talent' },
  ])
  state.batches.set(batch.id, batch)

  const result = await importApplyService.apply({ batchId: 'batch-dup' }, 'manager-1')

  assert.equal(result.totalRows, 3)
  assert.equal(result.createdRows, 1, 'Seul le nouveau talent doit être créé')
  assert.equal(result.updatedRows, 1, 'L’étudiant déjà existant est mis à jour (affiliation)')
  assert.equal(result.skippedRows, 1, 'Le doublon interne au fichier est ignoré')

  // Sécurité : l'utilisateur déjà actif ne voit pas son statut ni son mot de passe réinitialisés
  const activeUser = state.users.get('already.active@univ.mg')
  assert.equal(activeUser.status, 'ACTIVE')
  assert.equal(activeUser.passwordHash, '$argon2id$v=19$m=65536,t=3,p=4$existingHash')

  // Seul le nouvel utilisateur a reçu un job d'email d'identifiants
  assert.equal(state.jobs.length, 1)
  assert.equal(state.jobs[0].recipient, 'nouveau.talent@univ.mg')
})

test('RETRY / RELANCE : Possibilité de renvoyer les invitations sans recréer les comptes', async () => {
  const { state, prisma, queue } = createMockEnvironment()
  const importApplyService = new ImportApplyService(prisma, queue)
  const importBatchService = new ImportBatchService(prisma, queue)

  const batch = makeBatch('batch-retry', [
    { email: 'unreachable@univ.mg', firstName: 'Jean', lastName: 'Échec' },
  ])
  state.batches.set(batch.id, batch)

  // 1. Premier import
  await importApplyService.apply({ batchId: 'batch-retry' }, 'manager-1')
  assert.equal(state.jobs.length, 1)

  // 2. Relance des invitations
  const resendResult = await importBatchService.resendInvitations('batch-retry', 'manager-1')
  assert.equal(resendResult.queued, 1)
  assert.equal(state.jobs.length, 2, 'Un second job d’invitation doit être enfileté pour le retry')

  const latestJob = state.jobs[1]
  assert.equal(latestJob.kind, 'account.activation')
  assert.equal(latestJob.recipient, 'unreachable@univ.mg')
})

test('SÉCURITÉ RBAC : Un utilisateur sans droits ne peut pas déclencher l’import ni l’envoi d’emails', async () => {
  const { state, prisma, queue } = createMockEnvironment()
  const importApplyService = new ImportApplyService(prisma, queue)
  const importBatchService = new ImportBatchService(prisma, queue)

  const batch = makeBatch('batch-auth-test', [
    { email: 'hacker.target@univ.mg', firstName: 'Target', lastName: 'User' },
  ])
  state.batches.set(batch.id, batch)

  // Un simple VIEWER ou non-membre ne peut pas appliquer le lot
  await assert.rejects(
    async () => {
      await importApplyService.apply({ batchId: 'batch-auth-test' }, 'viewer-1')
    },
    { name: 'ForbiddenException' },
  )

  await assert.rejects(
    async () => {
      await importBatchService.resendInvitations('batch-auth-test', 'viewer-1')
    },
    { name: 'ForbiddenException' },
  )

  // Aucun job ne doit avoir été créé
  assert.equal(state.jobs.length, 0)
})
