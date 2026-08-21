import { strict as assert } from 'node:assert'
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

function dependencies(existing: Profile | null = null) {
  const state = { current: existing, updates: 0, creates: 0 }
  const transaction = {
    talentProfile: {
      findUnique: async () => state.current,
      update: async ({ data }: { data: Record<string, unknown> }) => { state.updates += 1; state.current = { ...state.current!, ...data } as Profile; return state.current },
      create: async ({ data }: { data: Record<string, unknown> }) => { state.creates += 1; state.current = { ...profile(String(data.userId)), ...data } as Profile; return state.current },
    },
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

test('E-12 expose les endpoints privés avec la permission talent:read', () => {
  assert.deepEqual(Reflect.getMetadata(PERMISSIONS_KEY, ProfileController), [Permission.TALENT_READ])
})
