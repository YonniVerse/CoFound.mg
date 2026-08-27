import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { ProjectsService } from '../src/projects/projects.service.js'
import { ProjectsController } from '../src/projects/projects.controller.js'
import { ProjectStatus } from '@cofound/shared'
import type { PrismaService } from '../src/prisma/prisma.service.js'

function mockPrismaService(projects: unknown[] = [], posts: unknown[] = []) {
  return {
    project: {
      findMany: async (args: Record<string, unknown>) => {
        const limit = typeof args.take === 'number' ? args.take : 21
        return projects.slice(0, limit)
      },
    },
    post: {
      findMany: async (args: Record<string, unknown>) => {
        const limit = typeof args.take === 'number' ? args.take : 21
        return posts.slice(0, limit)
      },
    },
  } as unknown as PrismaService
}

test('ProjectsService.getFeed returns paginated project cards', async () => {
  const mockDate = new Date('2026-08-20T10:00:00Z')
  const mockProjects = [
    {
      id: 'proj_1',
      title: 'AgriTech Madagascar',
      pitch: 'Solutions d’irrigation intelligentes pour agriculteurs',
      status: 'RECRUITING',
      createdAt: mockDate,
      sector: { id: 'sec_1', slug: 'agritech', labelKey: 'sectors.agritech' },
      region: { id: 'reg_1', slug: 'analamanga', labelKey: 'regions.analamanga' },
      createdBy: {
        talentProfile: {
          pseudonym: 'Razafy',
          avatarSeed: 'avatar_1',
        },
      },
      positions: [{ id: 'pos_1', isOpen: true }],
      members: [{ id: 'mem_1', leftAt: null }],
    },
  ]

  const service = new ProjectsService(mockPrismaService(mockProjects))
  const response = await service.getFeed({ limit: 20 })

  assert.equal(response.items.length, 1)
  const item = response.items[0]!
  assert.equal(item.id, 'proj_1')
  assert.equal(item.title, 'AgriTech Madagascar')
  assert.equal(item.status, ProjectStatus.RECRUITING)
  assert.equal(item.openPositionsCount, 1)
  assert.equal(item.membersCount, 1)
  assert.equal(item.owner?.pseudonym, 'Razafy')
  assert.equal(response.hasMore, false)
  assert.equal(response.nextCursor, null)
})

test('ProjectsService.getPostsFeed returns project-branded publication items', async () => {
  const mockDate = new Date('2026-08-20T10:00:00Z')
  const service = new ProjectsService(mockPrismaService([], [{
    id: 'post_1',
    projectId: 'proj_1',
    type: 'UPDATE',
    content: 'Nous avons validé notre première maquette.',
    expiresAt: null,
    createdAt: mockDate,
    project: {
      id: 'proj_1',
      title: 'AgriTech Madagascar',
      pitch: 'Solutions d’irrigation intelligentes pour agriculteurs',
      status: 'RECRUITING',
      sector: { id: 'sec_1', slug: 'agritech', labelKey: 'sectors.agritech' },
      region: null,
    },
  }]))

  const response = await service.getPostsFeed({ limit: 20 })

  assert.equal(response.items.length, 1)
  assert.equal(response.items[0]?.project.title, 'AgriTech Madagascar')
  assert.equal(response.items[0]?.content, 'Nous avons validé notre première maquette.')
  assert.equal(response.items[0]?.project.status, ProjectStatus.RECRUITING)
})

test('ProjectsController.getFeed handles valid query params', async () => {
  const service = new ProjectsService(mockPrismaService([]))
  const controller = new ProjectsController(service)

  const result = await controller.getFeed({
    status: 'RECRUITING',
    search: 'tech',
    limit: 10,
  })

  assert.equal(result.items.length, 0)
  assert.equal(result.hasMore, false)
})
