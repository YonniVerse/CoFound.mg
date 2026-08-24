import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { BadRequestException } from '@nestjs/common'
import { DreamMatchService } from '../src/dream-match/dream-match.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

function createPrismaMock() {
  const profile = {
    id: 'dream-1',
    talentId: 'talent-1',
    minAvailability: 12,
    preferredTeamSize: 4,
    institutionPref: 'Incubateur',
    sectors: ['sector-1'],
    skills: [{ skillId: 'skill-1', importance: 4 }],
  }
  const prisma = {
    talentProfile: {
      findUnique: async () => ({ id: 'talent-1', dreamMatchProfile: profile }),
    },
    $transaction: async (callback: (tx: typeof prisma) => unknown) => callback(prisma),
    skill: {
      findMany: async () => [{ id: 'skill-1' }],
    },
    sector: {
      findMany: async () => [{ id: 'sector-1' }],
    },
    dreamMatchProfile: {
      upsert: async () => profile,
      findUniqueOrThrow: async () => profile,
    },
    dreamMatchSkill: {
      deleteMany: async () => undefined,
      createMany: async () => undefined,
    },
  } as unknown as PrismaService
  return prisma
}

test('M-05 refuse l’enregistrement sans consentement explicite', async () => {
  const service = new DreamMatchService(createPrismaMock())
  await assert.rejects(
    service.upsertMine('user-1', { consent: false, sectors: [], skills: [] }),
    (error: unknown) => error instanceof BadRequestException,
  )
})

test('M-05 charge un profil Dream-Match sans identité civile', async () => {
  const service = new DreamMatchService(createPrismaMock())
  const response = await service.getMine('user-1')
  assert.equal(response.profile?.talentId, 'talent-1')
  assert.equal(response.profile?.skills[0]?.skillId, 'skill-1')
  assert.equal('firstName' in (response.profile ?? {}), false)
})

test('M-05 enregistre les préférences dans une transaction', async () => {
  const service = new DreamMatchService(createPrismaMock())
  const response = await service.upsertMine('user-1', {
    consent: true,
    minAvailability: 12,
    preferredTeamSize: 4,
    institutionPref: 'Incubateur',
    sectors: ['sector-1'],
    skills: [{ skillId: 'skill-1', importance: 4 }],
  })
  assert.equal(response.profile.sectors[0], 'sector-1')
  assert.equal(response.profile.skills[0]?.importance, 4)
})
