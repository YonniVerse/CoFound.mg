import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { assertEmailDeliveryConfig, readEmailConfig } from '../src/notifications/email-config.js'

test('E-01 lit la configuration email avec des valeurs sûres par défaut', () => {
  const config = readEmailConfig({})
  assert.deepEqual(config, { domain: 'cofound.mg', from: 'no-reply@cofound.mg', webhookSecret: undefined })
  assert.throws(() => assertEmailDeliveryConfig({ EMAIL_WEBHOOK_SECRET: 'short' }), /at least 32 characters/)
})
