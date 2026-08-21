import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { DreamMatchScoringService } from '../src/dream-match/dream-match-scoring.service.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

function createPrismaMock(rows: Array<Record<string, unknown>>) {
  return {
    dreamMatchProfile: {
      findFirst: async () => ({ id: 'dream-1' }),
    },
    $queryRaw: async () => rows,
  } as unknown as PrismaService
}

test('M-06 calcule un score borné et conserve les facteurs', async () => {
  const service = new DreamMatchScoringService(createPrismaMock([
    {
      talentId: 'talent-2',
      pseudonym: 'Masoandro',
      avatarSeed: 'seed-2',
      headline: 'Designer',
      bio: null,
      skillComplementarity: 40,
      sectorOverlap: 25,
      availability: 20,
    },
  ]))

  const response = await service.getSuggestions('user-1', { limit: 20 })
  assert.equal(response.items[0]?.score, 85)
  assert.deepEqual(response.items[0]?.factors, { skillComplementarity: 40, sectorOverlap: 25, availability: 20 })
  assert.equal('firstName' in (response.items[0] ?? {}), false)
  assert.equal(response.hasMore, false)
})

test('M-06 utilise un curseur et limite la page à la taille demandée', async () => {
  const service = new DreamMatchScoringService(createPrismaMock([
    { talentId: 'talent-2', pseudonym: 'A', avatarSeed: 'a', headline: null, bio: null, skillComplementarity: 10, sectorOverlap: 0, availability: 10 },
    { talentId: 'talent-3', pseudonym: 'B', avatarSeed: 'b', headline: null, bio: null, skillComplementarity: 20, sectorOverlap: 25, availability: 25 },
  ]))

  const response = await service.getSuggestions('user-1', { cursor: 'talent-1', limit: 1 })
  assert.equal(response.items.length, 1)
  assert.equal(response.hasMore, true)
  assert.equal(response.nextCursor, 'talent-2')
})
