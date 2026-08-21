import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { OnboardingService } from '../src/onboarding/onboarding.service.js'

test('E-13 retourne une progression initiale reprenable', async () => {
  const prisma = {
    talentProfile: { findUnique: async () => null },
  } as unknown as PrismaService
  const profile = { updateMine: async () => undefined, updateIdentity: async () => undefined } as never
  const result = await new OnboardingService(prisma, profile).getMine('user-1')
  assert.deepEqual(result.progress, { currentStep: 1, completedSteps: [], completion: 0, minimumCompletion: 60, isComplete: false, stepName: 'identity' })
  assert.equal(result.profile, null)
})

test('E-13 sauvegarde une étape et avance de manière idempotente', async () => {
  const state = { step: 1, completed: [] as number[] }
  const transaction = {
    talentProfile: {
      findUnique: async () => ({ id: 'profile-1', completion: 25, onboardingStep: state.step, onboardingCompletedSteps: state.completed }),
      update: async ({ data }: { data: { onboardingStep: number; onboardingCompletedSteps: number[] } }) => { state.step = data.onboardingStep; state.completed = data.onboardingCompletedSteps; return { id: 'profile-1', completion: 25, onboardingStep: state.step, onboardingCompletedSteps: state.completed } },
    },
  }
  const prisma = { $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction) } as unknown as PrismaService
  const profile = { updateMine: async () => ({ profile: {} }), updateIdentity: async () => ({ identity: {} }) } as never
  const service = new OnboardingService(prisma, profile)
  const first = await service.saveStep('user-1', { step: 2, data: { fieldId: 'field-1', cohortYear: 2026 } })
  const second = await service.saveStep('user-1', { step: 2, data: { fieldId: 'field-1', cohortYear: 2026 } })
  assert.deepEqual(first.progress.completedSteps, [2])
  assert.deepEqual(second.progress.completedSteps, [2])
  assert.equal(second.progress.currentStep, 3)
})

test('E-13 rejette une étape avec des données invalides', async () => {
  const prisma = {} as PrismaService
  const profile = { updateMine: async () => undefined, updateIdentity: async () => undefined } as never
  await assert.rejects(() => new OnboardingService(prisma, profile).saveStep('user-1', { step: 5, data: { availabilityHours: 999 } }), /Bad Request Exception/)
})
