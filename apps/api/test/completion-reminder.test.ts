import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { CompletionReminderService } from '../src/profile/completion-reminder.service.js'

const completeProfile = {
  completion: 75,
  pseudonym: 'rino',
  headline: 'Builder',
  bio: 'Bio',
  fieldId: 'field-1',
  cohortYear: 2026,
  availabilityHours: 10,
  goals: ['create'],
  sectors: ['sector-1'],
}

test('E-14 demande la complétion d’un profil absent', async () => {
  const prisma = { talentProfile: { findUnique: async () => null } } as unknown as PrismaService
  const result = await new CompletionReminderService(prisma).getMine('user-1')
  assert.equal(result.shouldRemind, true)
  assert.equal(result.completion, 0)
  assert.equal(result.missingFields.length, 8)
  assert.equal(result.ctaPath, '/onboarding')
})

test('E-14 ne relance pas un profil au-dessus du seuil', async () => {
  const prisma = { talentProfile: { findUnique: async () => completeProfile } } as unknown as PrismaService
  const result = await new CompletionReminderService(prisma).getMine('user-1')
  assert.equal(result.shouldRemind, false)
  assert.deepEqual(result.missingFields, [])
})

test('E-14 retourne uniquement les champs manquants sans identité sensible', async () => {
  const prisma = { talentProfile: { findUnique: async () => ({ ...completeProfile, completion: 25, bio: null, goals: [] }) } } as unknown as PrismaService
  const result = await new CompletionReminderService(prisma).getMine('user-1')
  assert.equal(result.shouldRemind, true)
  assert.deepEqual(result.missingFields, ['profile.fields.bio', 'profile.fields.goals'])
  assert.equal('gender' in result, false)
})
