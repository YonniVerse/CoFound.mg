import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { OnboardingController } from '../src/onboarding/onboarding.controller.js'
import { OnboardingService } from '../src/onboarding/onboarding.service.js'

async function startApp() {
  const calls: { userId?: string; input?: unknown } = {}
  const fake = {
    getMine: async (userId: string) => ({ progress: { currentStep: 2, completedSteps: [1], completion: 25, minimumCompletion: 60, isComplete: false, stepName: 'journey' }, profile: { id: 'profile-1', completion: 25 }, userId }),
    saveStep: async (userId: string, input: unknown) => { calls.userId = userId; calls.input = input; return { progress: { currentStep: 3, completedSteps: [1, 2], completion: 50, minimumCompletion: 60, isComplete: false, stepName: 'skills' }, profile: { id: 'profile-1', completion: 50 } } },
  }
  @Module({ controllers: [OnboardingController], providers: [{ provide: OnboardingService, useValue: fake }] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false })
  app.use((request: { user?: { userId: string } }, _response: unknown, next: () => void) => { request.user = { userId: 'user-1' }; next() })
  app.setGlobalPrefix('api/v1')
  await app.listen(0)
  const address = app.getHttpServer().address() as { port: number }
  return { app, baseUrl: `http://127.0.0.1:${address.port}`, calls }
}

test('E-13 expose la reprise et la sauvegarde d’une étape par HTTP', async () => {
  const { app, baseUrl, calls } = await startApp()
  try {
    const getResponse = await fetch(`${baseUrl}/api/v1/me/onboarding`)
    assert.equal(getResponse.status, 200)
    const progress = await getResponse.json() as { progress: { currentStep: number } }
    assert.equal(progress.progress.currentStep, 2)
    const patchResponse = await fetch(`${baseUrl}/api/v1/me/onboarding/steps/2`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: { cohortYear: 2026 } }) })
    assert.equal(patchResponse.status, 200)
    assert.deepEqual(calls, { userId: 'user-1', input: { data: { cohortYear: 2026 }, step: 2 } })
  } finally { await app.close() }
})
