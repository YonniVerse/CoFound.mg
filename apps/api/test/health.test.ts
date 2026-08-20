import assert from 'node:assert/strict'
import { test } from 'node:test'
import { HealthController } from '../src/health/health.controller.js'

test('health returns ok when PostgreSQL responds', async () => {
  const controller = new HealthController({
    $queryRaw: async () => [],
  } as never)
  const response = { statusCode: 200, status(code: number) {
    this.statusCode = code
  } }

  const result = await controller.getHealth(response)

  assert.deepEqual(result, { status: 'ok', database: 'ok' })
  assert.equal(response.statusCode, 200)
})

test('health returns 503 when PostgreSQL is unavailable', async () => {
  const controller = new HealthController({
    $queryRaw: async () => {
      throw new Error('database unavailable')
    },
  } as never)
  const response = { statusCode: 200, status(code: number) {
    this.statusCode = code
  } }

  const result = await controller.getHealth(response)

  assert.deepEqual(result, { status: 'degraded', database: 'unavailable' })
  assert.equal(response.statusCode, 503)
})
