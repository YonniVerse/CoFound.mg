import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { TalentsService } from '../src/talents/talents.service.js'
import { TalentsController } from '../src/talents/talents.controller.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

type MockProfile = {
  visibleInTalentFeed: boolean
  fieldId: string | null
  pseudonym: string
  headline: string | null
  bio: string | null
}

type MockFeedArgs = {
  where?: {
    fieldId?: string
    OR?: Array<{ pseudonym: { contains: string } }>
  }
  take?: number
}

function mockPrisma(profiles: MockProfile[] = []) {
  return {
    talentProfile: {
      findMany: async (args: MockFeedArgs) => {
        let result = profiles.filter((profile) => profile.visibleInTalentFeed)
        if (args.where?.fieldId) {
          result = result.filter((profile) => profile.fieldId === args.where?.fieldId)
        }
        const search = args.where?.OR?.[0]?.pseudonym.contains.toLowerCase()
        if (search) {
          result = result.filter(
            (profile) =>
              profile.pseudonym.toLowerCase().includes(search) ||
              profile.headline?.toLowerCase().includes(search) ||
              profile.bio?.toLowerCase().includes(search),
          )
        }
        const take = args.take ?? 21
        return result.slice(0, take)
      },
    },
  } as unknown as PrismaService
}

const mockProfile1 = {
  id: 'talent-1',
  userId: 'user-1',
  pseudonym: 'Tsiky',
  avatarSeed: 'seed-1',
  headline: 'Développeur Fullstack React/NestJS',
  bio: 'Passionné par la tech et les startups à Madagascar.',
  fieldId: 'field-cs',
  field: { id: 'field-cs', slug: 'computer-science', labelKey: 'Informatique' },
  cohortYear: 2024,
  availabilityHours: 20,
  goals: ['Co-fondateur Tech', 'Projet Impact'],
  completion: 85,
  visibleInTalentFeed: true,
  skills: [
    { skill: { id: 'sk-1', slug: 'react', labelKey: 'React' } },
    { skill: { id: 'sk-2', slug: 'nestjs', labelKey: 'NestJS' } },
  ],
}

const mockProfilePrivate = {
  id: 'talent-2',
  userId: 'user-2',
  pseudonym: 'AnonymePrivate',
  avatarSeed: 'seed-2',
  headline: 'Profil non opt-in',
  bio: 'Ne doit pas apparaître dans le feed public.',
  fieldId: null,
  field: null,
  cohortYear: null,
  availabilityHours: null,
  goals: [],
  completion: 30,
  visibleInTalentFeed: false, // Opt-in IS FALSE
  skills: [],
}

test('TalentsService: return only opt-in profiles (visibleInTalentFeed=true)', async () => {
  const prisma = mockPrisma([mockProfile1, mockProfilePrivate])
  const service = new TalentsService(prisma)

  const result = await service.getFeed({ limit: 20 })

  assert.equal(result.items.length, 1)
  assert.equal(result.items[0]?.pseudonym, 'Tsiky')
  assert.equal(result.items[0]?.id, 'talent-1')
  assert.equal(result.items[0]?.skills.length, 2)
  assert.equal(result.hasMore, false)
})

test('TalentsService: search filter by pseudonym/headline', async () => {
  const prisma = mockPrisma([mockProfile1, mockProfilePrivate])
  const service = new TalentsService(prisma)

  const resultMatch = await service.getFeed({ search: 'Fullstack', limit: 20 })
  assert.equal(resultMatch.items.length, 1)

  const resultNoMatch = await service.getFeed({ search: 'Inexistant', limit: 20 })
  assert.equal(resultNoMatch.items.length, 0)
})

test('TalentsController: getFeed endpoint parses query correctly', async () => {
  const prisma = mockPrisma([mockProfile1])
  const service = new TalentsService(prisma)
  const controller = new TalentsController(service)

  const response = await controller.getFeed({ search: 'Tsiky', limit: '10' })
  assert.equal(response.items.length, 1)
  assert.equal(response.items[0]?.pseudonym, 'Tsiky')
})
