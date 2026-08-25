import { strict as assert } from 'node:assert'
import { BadRequestException } from '@nestjs/common'
import { test } from 'node:test'
import { ProfileController } from '../src/profile/profile.controller.js'
import { ProfileService } from '../src/profile/profile.service.js'
import { PERMISSIONS_KEY } from '../src/rbac/rbac.decorators.js'
import { Permission } from '../src/rbac/permissions.js'
import type { PrismaService } from '../src/prisma/prisma.service.js'

type Profile = {
  id: string
  userId: string
  pseudonym: string
  avatarSeed: string
  headline: string | null
  bio: string | null
  fieldId: string | null
  cohortYear: number | null
  level: string | null
  availabilityHours: number | null
  goals: unknown
  sectors: unknown
  completion: number
  visibleInTalentFeed: boolean
  field: { id: string; slug: string; labelKey: string } | null
}

function profile(userId: string): Profile {
  return { id: 'profile-1', userId, pseudonym: 'Ravinala', avatarSeed: 'cofound-user-1', headline: null, bio: null, fieldId: null, cohortYear: null, level: null, availabilityHours: null, goals: [], sectors: [], completion: 13, visibleInTalentFeed: false, field: null }
}

function dependencies(existing: Profile | null = null, references: { field: boolean; sectors: boolean } = { field: true, sectors: true }) {
  const state = { current: existing, updates: 0, creates: 0 }
  const transaction = {
    talentProfile: {
      findUnique: async () => state.current,
      update: async ({ data }: { data: Record<string, unknown> }) => { state.updates += 1; state.current = { ...state.current!, ...data } as Profile; return state.current },
      create: async ({ data }: { data: Record<string, unknown> }) => { state.creates += 1; state.current = { ...profile(String(data.userId)), ...data } as Profile; return state.current },
    },
    field: { findFirst: async () => references.field ? { id: 'field-1' } : null },
    sector: { findMany: async () => references.sectors ? [{ id: 'sector-1' }] : [] },
  }
  const prisma = {
    user: {
      findUnique: async () => ({ id: 'user-1', email: 'talent@example.mg', locale: 'fr', talentIdentity: { firstName: 'Ravinala', lastName: 'Andry', photoKey: null, phone: null, regionId: null }, talentProfile: state.current }),
    },
    $transaction: async (callback: (tx: typeof transaction) => Promise<Profile>) => callback(transaction),
  } as unknown as PrismaService
  return { prisma, state }
}

const validInput = { pseudonym: 'Ravinala', headline: 'Créatrice de solutions', bio: 'Je construis des projets utiles.', fieldId: 'field-1', cohortYear: 2026, availabilityHours: 12, goals: ['Créer'], sectorIds: ['sector-1'], visibleInTalentFeed: true }

test('E-12 lit un profil privé sans exposer le genre', async () => {
  const deps = dependencies(profile('user-1'))
  const result = await new ProfileService(deps.prisma).getMine('user-1')
  assert.equal(result.identity?.firstName, 'Ravinala')
  assert.equal('gender' in (result.identity ?? {}), false)
  assert.equal(result.profile?.pseudonym, 'Ravinala')
})

test('E-12 crée ou met à jour le profil dans une transaction et calcule la complétion', async () => {
  const deps = dependencies()
  const result = await new ProfileService(deps.prisma).updateMine('user-1', validInput)
  assert.equal(deps.state.creates, 1)
  assert.equal(deps.state.updates, 0)
  assert.equal(result.profile.completion, 100)
  assert.equal(result.profile.visibleInTalentFeed, true)

  await new ProfileService(deps.prisma).updateMine('user-1', { ...validInput, bio: '' })
  assert.equal(deps.state.updates, 1)
})

test('E-12 masque la visibilité lorsque la complétion est sous le seuil', async () => {
  const deps = dependencies()
  const result = await new ProfileService(deps.prisma).updateMine('user-1', { pseudonym: 'Ravinala', goals: [], sectorIds: [], visibleInTalentFeed: true })
  assert.equal(result.profile.completion, 13)
  assert.equal(result.profile.visibleInTalentFeed, false)
})

test('E-12 rejette une entrée de profil invalide avec une erreur de validation', async () => {
  const deps = dependencies()
  await assert.rejects(() => new ProfileService(deps.prisma).updateMine('user-1', { pseudonym: '' }), (error: unknown) => {
    assert.ok(error instanceof BadRequestException)
    const response = error.getResponse()
    assert.equal(typeof response, 'object')
    assert.equal((response as { code?: string }).code, 'VALIDATION_FAILED')
    assert.equal((response as { messageKey?: string }).messageKey, 'profile.errors.invalidInput')
    return true
  })
  assert.equal(deps.state.creates, 0)
})

test('E-12 rejette les référentiels inactifs avant toute écriture', async () => {
  const fieldDeps = dependencies(null, { field: false, sectors: true })
  await assert.rejects(() => new ProfileService(fieldDeps.prisma).updateMine('user-1', validInput), /Bad Request Exception/)
  assert.equal(fieldDeps.state.creates, 0)

  const sectorDeps = dependencies(null, { field: true, sectors: false })
  await assert.rejects(() => new ProfileService(sectorDeps.prisma).updateMine('user-1', validInput), /Bad Request Exception/)
  assert.equal(sectorDeps.state.creates, 0)
})

test('E-12 expose les endpoints privés avec la permission talent:self', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProfileController), [Permission.TALENT_SELF])
})
