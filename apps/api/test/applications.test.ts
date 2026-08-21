import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { ApplicationsService } from '../src/applications/applications.service.js'
import { ApplicationsController } from '../src/applications/applications.controller.js'
import { ApplicationStatus, ProjectStatus } from '@cofound/shared'
import type { PrismaService } from '../src/prisma/prisma.service.js'

function mockPrisma(initialData: {
  projects?: any[]
  positions?: any[]
  applications?: any[]
} = {}) {
  const projects = initialData.projects ?? [
    {
      id: 'proj-1',
      title: 'EcoDrive',
      pitch: 'Covoiturage étudiant',
      status: ProjectStatus.RECRUITING,
    },
  ]
  const positions = initialData.positions ?? [
    {
      id: 'pos-1',
      projectId: 'proj-1',
      title: 'Développeur React',
      description: 'Front-end dev',
      isOpen: true,
    },
  ]
  const applications = initialData.applications ?? []

  return {
    project: {
      findUnique: async ({ where }: any) =>
        projects.find((p) => p.id === where.id) ?? null,
    },
    openPosition: {
      findUnique: async ({ where }: any) =>
        positions.find((p) => p.id === where.id) ?? null,
    },
    application: {
      findFirst: async ({ where }: any) =>
        applications.find(
          (a) =>
            a.projectId === where.projectId &&
            a.applicantId === where.applicantId &&
            a.status === where.status,
        ) ?? null,
      findUnique: async ({ where }: any) =>
        applications.find((a) => a.id === where.id) ?? null,
      findMany: async ({ where }: any) =>
        applications.filter((a) => a.applicantId === where.applicantId),
      create: async ({ data }: any) => {
        const proj = projects.find((p) => p.id === data.projectId)
        const pos = positions.find((p) => p.id === data.positionId)
        const newApp = {
          id: 'app-' + (applications.length + 1),
          projectId: data.projectId,
          positionId: data.positionId ?? null,
          applicantId: data.applicantId,
          message: data.message,
          status: data.status,
          rejectionReason: null,
          decidedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          project: proj,
          position: pos ?? null,
        }
        applications.push(newApp)
        return newApp
      },
      update: async ({ where, data }: any) => {
        const app = applications.find((a) => a.id === where.id)
        if (app) {
          app.status = data.status
        }
        return app
      },
    },
  } as unknown as PrismaService
}

test('ApplicationsService: submits a valid application successfully', async () => {
  const prisma = mockPrisma()
  const service = new ApplicationsService(prisma)

  const result = await service.create('user-1', {
    projectId: 'proj-1',
    positionId: 'pos-1',
    message: 'Je souhaite vivement rejoindre votre projet en tant que développeur React.',
  })

  assert.equal(result.projectId, 'proj-1')
  assert.equal(result.positionId, 'pos-1')
  assert.equal(result.status, ApplicationStatus.PENDING)
  assert.equal(result.project.title, 'EcoDrive')
})

test('ApplicationsService: rejects duplicate pending application for same project', async () => {
  const prisma = mockPrisma({
    applications: [
      {
        id: 'app-existing',
        projectId: 'proj-1',
        positionId: 'pos-1',
        applicantId: 'user-1',
        message: 'Candidature initiale',
        status: ApplicationStatus.PENDING,
        rejectionReason: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: { id: 'proj-1', title: 'EcoDrive', pitch: 'Test', status: ProjectStatus.RECRUITING },
        position: { id: 'pos-1', title: 'Dev', description: null, isOpen: true },
      },
    ],
  })
  const service = new ApplicationsService(prisma)

  await assert.rejects(
    async () => {
      await service.create('user-1', {
        projectId: 'proj-1',
        message: 'Tentative de double candidature',
      })
    },
    (err: unknown) => err instanceof ConflictException,
  )
})

test('ApplicationsService: candidate can list their own applications', async () => {
  const prisma = mockPrisma({
    applications: [
      {
        id: 'app-1',
        projectId: 'proj-1',
        positionId: 'pos-1',
        applicantId: 'user-1',
        message: 'Mon message de candidature',
        status: ApplicationStatus.PENDING,
        rejectionReason: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: { id: 'proj-1', title: 'EcoDrive', pitch: 'Pitch', status: ProjectStatus.RECRUITING },
        position: null,
      },
    ],
  })
  const service = new ApplicationsService(prisma)

  const result = await service.getMyApplications('user-1')

  assert.equal(result.items.length, 1)
  assert.equal(result.items[0]?.id, 'app-1')
})

test('ApplicationsService: candidate can withdraw pending application', async () => {
  const prisma = mockPrisma({
    applications: [
      {
        id: 'app-1',
        projectId: 'proj-1',
        positionId: null,
        applicantId: 'user-1',
        message: 'Message',
        status: ApplicationStatus.PENDING,
        rejectionReason: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: { id: 'proj-1', title: 'EcoDrive', pitch: 'Pitch', status: ProjectStatus.RECRUITING },
        position: null,
      },
    ],
  })
  const service = new ApplicationsService(prisma)

  const result = await service.withdraw('user-1', 'app-1')

  assert.equal(result.status, ApplicationStatus.WITHDRAWN)
})

test('ApplicationsController: exposes endpoints with permissions', async () => {
  const prisma = mockPrisma()
  const service = new ApplicationsService(prisma)
  const controller = new ApplicationsController(service)

  const req = { user: { userId: 'user-1', platformRole: 'TALENT', status: 'ACTIVE' } } as any

  const response = await controller.create(req, {
    projectId: 'proj-1',
    message: 'Message de candidature valide de plus de 10 caractères',
  })

  assert.equal(response.projectId, 'proj-1')
})
