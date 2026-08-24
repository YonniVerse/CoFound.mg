import assert from 'node:assert/strict'
import test from 'node:test'
import { serializeExpiredRefreshCookie, serializeRefreshCookie } from '../src/auth/auth.controller.js'

test('le cookie de refresh est cross-site et sécurisé en production', () => {
  const expiresAt = new Date('2026-09-01T12:00:00.000Z')
  const cookie = serializeRefreshCookie('refresh-token', expiresAt, { NODE_ENV: 'production' })

  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /Path=\/api\/v1\/auth/)
  assert.match(cookie, /SameSite=None/)
  assert.match(cookie, /Secure/)
  assert.match(cookie, /Expires=Tue, 01 Sep 2026 12:00:00 GMT/)
})

test('le cookie de refresh reste utilisable en développement local', () => {
  const cookie = serializeRefreshCookie('refresh-token', new Date('2026-09-01T12:00:00.000Z'), { NODE_ENV: 'development' })

  assert.match(cookie, /SameSite=Lax/)
  assert.doesNotMatch(cookie, /; Secure/)
})

test('la suppression du cookie reprend les mêmes attributs de site', () => {
  const cookie = serializeExpiredRefreshCookie({ NODE_ENV: 'production' })

  assert.match(cookie, /Max-Age=0/)
  assert.match(cookie, /SameSite=None/)
  assert.match(cookie, /Secure/)
  assert.match(cookie, /Path=\/api\/v1\/auth/)
})
