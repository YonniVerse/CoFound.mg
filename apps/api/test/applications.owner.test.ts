import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ApplicationsService } from '../src/applications/applications.service.js'
import { ApplicationStatus, ProjectStatus } from '@cofound/shared'
import type { PrismaService } from '../src/prisma/prisma.service.js'

type FixtureApplication = {
  id: string
  projectId: string
  applicantId: string
  positionId: string | null
  message: string
  status: ApplicationStatus
  rejectionReason: string | null
  decidedAt: Date | null
  decidedById?: string | null
  createdAt: Date
  updatedAt: Date
  project: { id: string; title: string; pitch: string; status: ProjectStatus; createdById?: string }
  position: { id: string; title: string; description: string | null } | null
  applicant: { talentProfile: { pseudonym: string; avatarSeed: string; headline: string | null } }
}

function createFixture(status: ApplicationStatus = ApplicationStatus.PENDING): FixtureApplication {
  return {
    id: 'app-1', projectId: 'project-1', applicantId: 'candidate-1', positionId: null,
    message: 'Je souhaite rejoindre ce projet.', status, rejectionReason: null,
    decidedAt: null, createdAt: new Date(), updatedAt: new Date(),
    project: { id: 'project-1', title: 'EcoDrive', pitch: 'Pitch', status: ProjectStatus.RECRUITING, createdById: 'owner-1' },
    position: null,
    applicant: { talentProfile: { pseudonym: 'Candidat-42', avatarSeed: 'seed', headline: 'Développeur' } },
  }
}

function mockPrisma(application = createFixture()) {
  const project = { id: 'project-1', createdById: 'owner-1' }
  const prisma = {
    project: { findUnique: async () => project },
    application: {
      findMany: async () => [application],
      findUnique: async () => application,
      updateMany: async ({ data }: { data: Partial<FixtureApplication> }) => {
        if (application.status !== ApplicationStatus.PENDING) return { count: 0 }
        Object.assign(application, data)
        return { count: 1 }
      },
      findUniqueOrThrow: async () => application,
    },
    $transaction: async <T>(callback: (tx: PrismaService) => Promise<T>) =>
      callback(prisma as unknown as PrismaService),
  }
  return prisma as unknown as PrismaService
}

test('P-06: owner can list pseudonymized project applications', async () => {
  const service = new ApplicationsService(mockPrisma())
  const result = await service.getProjectApplications('project-1', 'owner-1')
  assert.equal(result.items.length, 1)
  assert.equal(result.items[0]?.candidate.pseudonym, 'Candidat-42')
})

test('P-06: non-owner cannot access the application queue', async () => {
  const service = new ApplicationsService(mockPrisma())
  await assert.rejects(() => service.getProjectApplications('project-1', 'other-user'), NotFoundException)
})

test('P-06: owner accepts a pending application transactionally', async () => {
  const application = createFixture()
  const service = new ApplicationsService(mockPrisma(application))
  const result = await service.accept('owner-1', 'app-1')
  assert.equal(result.status, ApplicationStatus.ACCEPTED)
  assert.equal(result.candidate.pseudonym, 'Candidat-42')
})

test('P-06: owner rejection requires a pending application', async () => {
  const application = createFixture(ApplicationStatus.ACCEPTED)
  const service = new ApplicationsService(mockPrisma(application))
  await assert.rejects(
    () => service.reject('owner-1', 'app-1', { rejectionReason: 'Trop tard' }),
    BadRequestException,
  )
})
