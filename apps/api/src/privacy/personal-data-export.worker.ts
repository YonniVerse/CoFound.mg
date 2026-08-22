import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PgBoss } from 'pg-boss'
import { PrismaClient, PersonalDataExportStatus } from '@prisma/client'
import { PERSONAL_DATA_EXPORT_QUEUE, type PersonalDataExportJob } from './personal-data-export-job.js'

const DEFAULT_EXPIRY_HOURS = 24
export type PersonalDataExportWorker = { boss: PgBoss; workId: string; stop: () => Promise<void> }

export async function startPersonalDataExportWorker(prisma = new PrismaClient()): Promise<PersonalDataExportWorker> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required to start the personal data export worker')
  const boss = new PgBoss(connectionString)
  boss.on('error', (error) => console.error('[pg-boss] personal export worker error', error))
  await boss.start()
  await boss.createQueue(PERSONAL_DATA_EXPORT_QUEUE)
  const workId = await boss.work<PersonalDataExportJob>(PERSONAL_DATA_EXPORT_QUEUE, async ([job]) => {
    if (!job) return
    await processExport(prisma, job.data)
  })
  return { boss, workId, stop: async () => { await boss.stop(); await prisma.$disconnect() } }
}

export async function processExport(prisma: PrismaClient, job: PersonalDataExportJob): Promise<void> {
  const claimed = await prisma.personalDataExport.updateMany({ where: { id: job.exportId, userId: job.userId, status: PersonalDataExportStatus.PENDING }, data: { status: PersonalDataExportStatus.PROCESSING } })
  if (claimed.count === 0) return
  try {
    const user = await prisma.user.findUnique({ where: { id: job.userId }, select: { id: true, email: true, status: true, platformRole: true, locale: true, activatedAt: true, lastLoginAt: true, createdAt: true, talentProfile: { select: { pseudonym: true, avatarSeed: true, headline: true, bio: true, fieldId: true, cohortYear: true, level: true, availabilityHours: true, goals: true, sectors: true, completion: true, visibleInTalentFeed: true, createdAt: true, updatedAt: true } }, talentIdentity: { select: { firstName: true, lastName: true, photoKey: true, phone: true, regionId: true, gender: true } }, consents: { select: { purpose: true, policyVersion: true, grantedAt: true, revokedAt: true } }, affiliations: { select: { organizationId: true, isCertifying: true, status: true, fieldId: true, cohortYear: true, startedAt: true, endedAt: true } }, projectsCreated: { select: { id: true, title: true, pitch: true, status: true, sectorId: true, regionId: true, createdAt: true, updatedAt: true, publishedAt: true } }, applications: { select: { id: true, projectId: true, positionId: true, message: true, status: true, rejectionReason: true, decidedAt: true, createdAt: true, updatedAt: true } }, notifications: { select: { id: true, type: true, payload: true, readAt: true, createdAt: true } } } })
    if (!user) throw new Error('EXPORT_USER_NOT_FOUND')
    const archive = { exportVersion: 1, generatedAt: new Date().toISOString(), data: user, metadata: { pseudonymizedOtherUsers: true, containsOwnCivilIdentity: true, excludesCredentialsAndTokens: true } }
    const directory = process.env.PERSONAL_EXPORT_DIR ?? '/tmp/cofound-personal-exports'
    const userDirectory = join(directory, job.userId)
    await mkdir(userDirectory, { recursive: true })
    const storageKey = `${job.userId}/${job.exportId}.json`
    await writeFile(join(userDirectory, `${job.exportId}.json`), JSON.stringify(archive), { encoding: 'utf8', flag: 'w' })
    const expiresAt = new Date(Date.now() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000)
    await prisma.personalDataExport.update({ where: { id: job.exportId }, data: { status: PersonalDataExportStatus.READY, storageKey, completedAt: new Date(), expiresAt, errorCode: null } })
  } catch (error) {
    await prisma.personalDataExport.update({ where: { id: job.exportId }, data: { status: PersonalDataExportStatus.FAILED, errorCode: error instanceof Error ? 'EXPORT_PROCESSING_FAILED' : 'EXPORT_UNKNOWN_ERROR' } })
    throw error
  }
}
