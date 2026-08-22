import 'reflect-metadata'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { searchQuerySchema } from '@cofound/shared'

test('M-01 — valider le schéma de requête de recherche', () => {
  const parsed = searchQuerySchema.parse({ q: '  technologie  ' })
  assert.equal(parsed.q, 'technologie')
  assert.equal(parsed.type, 'all')
  assert.equal(parsed.limit, 20)
})

test('M-01 — la requête de recherche refuse les chaînes vides', () => {
  assert.throws(() => searchQuerySchema.parse({ q: '   ' }))
})
