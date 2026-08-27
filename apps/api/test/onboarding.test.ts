import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { OnboardingService } from '../src/onboarding/onboarding.service.js'

test('E-13 retourne une progression initiale reprenable', async () => {
  const prisma = {
    user: { findUnique: async () => null },
  } as unknown as PrismaService
  const result = await new OnboardingService(prisma).getMine('user-1')
  assert.deepEqual(result.progress, { currentStep: 1, completedSteps: [], completion: 0, minimumCompletion: 60, isComplete: false, stepName: 'identity' })
  assert.equal(result.profile, null)
})

test('E-13 sauvegarde une étape et avance de manière idempotente', async () => {
  const state = { step: 2, completed: [] as number[] }
  const transaction = {
    talentProfile: {
      findUnique: async () => ({ id: 'profile-1', completion: 25, onboardingStep: state.step, onboardingCompletedSteps: state.completed }),
      update: async ({ data }: { data: { onboardingStep?: number; onboardingCompletedSteps?: number[] } }) => { const nextStep = data.onboardingStep ?? state.step; const nextCompleted = data.onboardingCompletedSteps ?? state.completed; state.step = nextStep; state.completed = nextCompleted; return { id: 'profile-1', completion: 25, onboardingStep: nextStep, onboardingCompletedSteps: nextCompleted } },
    },
  }
  const prisma = { $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction) } as unknown as PrismaService
  const service = new OnboardingService(prisma)
  const first = await service.saveStep('user-1', { step: 2, data: { cohortYear: 2026 } })
  const second = await service.saveStep('user-1', { step: 2, data: { cohortYear: 2026 } })
  assert.deepEqual(first.progress.completedSteps, [2])
  assert.deepEqual(second.progress.completedSteps, [2])
  assert.equal(second.progress.currentStep, 3)
})

test('E-13 rejette une étape avec des données invalides', async () => {
  const prisma = {} as PrismaService
  await assert.rejects(() => new OnboardingService(prisma).saveStep('user-1', { step: 5, data: { availabilityHours: 999 } }), /Bad Request Exception/)
})
