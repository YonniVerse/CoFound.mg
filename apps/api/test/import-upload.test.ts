import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import * as XLSX from 'xlsx'
import { ImportUploadService } from '../src/import/import-upload.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

type TestState = {
  batches: Map<string, Record<string, unknown>>
  rows: Map<string, Record<string, unknown>[]>
  users: Map<string, Record<string, unknown>>
  members: Record<string, unknown>[]
}

function fakeUploadDependencies(existingUsers: Record<string, unknown>[] = []) {
  const state: TestState = {
    batches: new Map(),
    rows: new Map(),
    users: new Map(existingUsers.map((u) => [String(u.email), u])),
    members: [
      { userId: 'manager-1', organizationId: 'org-1', role: 'ORG_MANAGER' },
    ],
  }

  const transaction = {
    importBatch: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const batch = { id: `batch-${state.batches.size + 1}`, ...data }
        state.batches.set(batch.id, batch)
        return batch
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const batch = state.batches.get(where.id)
        if (!batch) throw new Error('batch not found')
        Object.assign(batch, data)
        return batch
      },
      findUnique: async ({ where }: { where: { id: string } }) => state.batches.get(where.id) ?? null,
    },
    importRow: {
      createMany: async ({ data }: { data: Record<string, unknown>[] }) => {
        for (const rowData of data) {
          const row = { id: `row-${Math.random().toString(36).slice(2)}`, ...rowData }
          const batchRows = state.rows.get(String(rowData.batchId)) || []
          batchRows.push(row)
          state.rows.set(String(rowData.batchId), batchRows)
        }
        return { count: data.length }
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        for (const batchRows of state.rows.values()) {
          const row = batchRows.find((r) => r.id === where.id)
          if (row) {
            Object.assign(row, data)
            return row
          }
        }
        return data
      },
      findMany: async ({ where }: { where: { batchId: string } }) => {
        return state.rows.get(where.batchId) || []
      },
    },
  }

  const prisma = {
    importBatch: transaction.importBatch,
    importRow: transaction.importRow,
    user: {
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.id) return { id: where.id, platformRole: 'ORG_MEMBER' }
        if (where.email) return state.users.get(where.email) ?? null
        return null
      },
      findMany: async ({ where }: { where?: { email?: { in?: string[] } } }) => {
        if (where?.email?.in) {
          const emails: string[] = where.email.in
          return emails.map((e) => state.users.get(e)).filter(Boolean)
        }
        return []
      },
    },
    organizationMember: {
      findMany: async () => state.members,
      findUnique: async () => state.members[0] ?? null,
    },
    organization: {
      findFirst: async () => ({ id: 'org-1' }),
    },
    $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction),
  } as unknown as PrismaService

  return { state, prisma }
}

test('ImportUploadService: upload CSV, extrait les colonnes et prépare le lot PREVIEW', async () => {
  const deps = fakeUploadDependencies()
  const service = new ImportUploadService(deps.prisma)

  const csvContent = [
    'Adresse e-mail,Prénom,Nom,Filière,Niveau,Année d\'entrée',
    'mialy.randria@example.mg,Mialy,Randria,Informatique,L3,2024',
    'fara.rakoto@example.mg,Fara,Rakoto,Gestion,M1,2024',
  ].join('\n')

  const file = {
    buffer: Buffer.from(csvContent, 'utf-8'),
    originalname: 'etudiants.csv',
    size: csvContent.length,
    fieldname: 'file',
    encoding: '7bit',
    mimetype: 'text/csv',
  } as Express.Multer.File

  const uploadResult = await service.upload(file, 'manager-1', 'org-1')

  assert.equal(uploadResult.fileName, 'etudiants.csv')
  assert.equal(uploadResult.totalRows, 2)
  assert.equal(uploadResult.errorRows, 0)
  assert.equal(uploadResult.missingRequiredFields.length, 0)
  assert.ok(uploadResult.batchId)

  const previewResult = await service.getPreview(uploadResult.batchId, 'manager-1')
  assert.equal(previewResult.rows.length, 2)
  assert.equal(previewResult.rows[0]?.displayName, 'Mialy Randria')
  assert.equal(previewResult.rows[0]?.result, 'CREATED')
})

test('ImportUploadService: détecte doublons dans le fichier et utilisateurs existants dans getPreview', async () => {
  const existingUser = { id: 'user-existing', email: 'fara.rakoto@example.mg', status: 'ACTIVE' }
  const deps = fakeUploadDependencies([existingUser])
  const service = new ImportUploadService(deps.prisma)

  const csvContent = [
    'Adresse e-mail,Prénom,Nom,Filière,Niveau,Année d\'entrée',
    'mialy.randria@example.mg,Mialy,Randria,Informatique,L3,2024',
    'fara.rakoto@example.mg,Fara,Rakoto,Gestion,M1,2024',
    'mialy.randria@example.mg,Mialy,Randria,Informatique,L3,2024',
    'email-invalide,Jean,Rakoto,Droit,L1,2025',
  ].join('\n')

  const file = {
    buffer: Buffer.from(csvContent, 'utf-8'),
    originalname: 'test-cases.csv',
    size: csvContent.length,
    fieldname: 'file',
    encoding: '7bit',
    mimetype: 'text/csv',
  } as Express.Multer.File

  const uploadResult = await service.upload(file, 'manager-1', 'org-1')
  const previewResult = await service.getPreview(uploadResult.batchId, 'manager-1')

  assert.equal(previewResult.rows.length, 4)
  assert.equal(previewResult.rows[0]?.result, 'CREATED')
  assert.equal(previewResult.rows[1]?.result, 'UPDATED')
  assert.equal(previewResult.rows[2]?.result, 'SKIPPED_DUPLICATE')
  assert.equal(previewResult.rows[3]?.result, 'ERROR')
})

test('ImportUploadService: updateMapping ré-évalue les lignes avec le nouveau mapping', async () => {
  const deps = fakeUploadDependencies()
  const service = new ImportUploadService(deps.prisma)

  const csvContent = [
    'Courriel univ,Prenom etu,Nom etu,Domaine,Classe,Annee',
    'toky@univ.mg,Toky,Ramaharo,Informatique,M2,2022',
  ].join('\n')

  const file = {
    buffer: Buffer.from(csvContent, 'utf-8'),
    originalname: 'custom.csv',
    size: csvContent.length,
    fieldname: 'file',
    encoding: '7bit',
    mimetype: 'text/csv',
  } as Express.Multer.File

  const uploadResult = await service.upload(file, 'manager-1', 'org-1')

  const customMapping = {
    'Courriel univ': 'email' as const,
    'Prenom etu': 'firstName' as const,
    'Nom etu': 'lastName' as const,
    'Domaine': 'fieldOfStudy' as const,
    'Classe': 'level' as const,
    'Annee': 'entryYear' as const,
  }

  const updateResult = await service.updateMapping(uploadResult.batchId, 'manager-1', customMapping)
  assert.equal(updateResult.updated, true)

  const preview = await service.getPreview(uploadResult.batchId, 'manager-1')
  assert.equal(preview.rows[0]?.email, 'toky@univ.mg')
  assert.equal(preview.rows[0]?.displayName, 'Toky Ramaharo')
  assert.equal(preview.rows[0]?.result, 'CREATED')
})

test('ImportUploadService: upload XLSX et analyse les lignes correctement', async () => {
  const deps = fakeUploadDependencies()
  const service = new ImportUploadService(deps.prisma)

  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Adresse e-mail', 'Prénom', 'Nom', 'Filière', 'Niveau', "Année d'entrée", 'Genre', 'Matricule'],
    ['hery.andria@example.mg', 'Hery', 'Andrianina', 'Génie Civil', 'L2', '2023', 'M', 'ETU-015'],
  ])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Promotion')
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer

  const file = {
    buffer,
    originalname: 'etudiants.xlsx',
    size: buffer.length,
    fieldname: 'file',
    encoding: '7bit',
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  } as Express.Multer.File

  const uploadResult = await service.upload(file, 'manager-1', 'org-1')
  assert.equal(uploadResult.fileName, 'etudiants.xlsx')
  assert.equal(uploadResult.totalRows, 1)
  assert.equal(uploadResult.errorRows, 0)

  const preview = await service.getPreview(uploadResult.batchId, 'manager-1')
  assert.equal(preview.rows.length, 1)
  assert.equal(preview.rows[0]?.displayName, 'Hery Andrianina')
  assert.equal(preview.rows[0]?.email, 'hery.andria@example.mg')
})
