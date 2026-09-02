import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { EmailTemplateService } from '../src/notifications/email-template.service.js'

test('E-02 rend les gabarits d’activation en français et en malgache', () => {
  const templates = new EmailTemplateService()
  const fr = templates.render({ kind: 'account.activation', recipient: 'fara@example.mg', activationToken: 'token-fr', locale: 'fr' })
  const mg = templates.render({ kind: 'account.activation', recipient: 'fara@example.mg', activationToken: 'token-mg', locale: 'mg' })

  assert.equal(fr.to, 'fara@example.mg')
  assert.match(fr.subject, /CoFound\.mg/)
  assert.match(fr.text, /token-fr/)
  assert.match(mg.subject, /kaontinao/)
  assert.match(mg.html, /token-mg/)
})

test('rend les gabarits d’identifiants initiaux avec mot de passe temporaire', () => {
  const templates = new EmailTemplateService()
  const fr = templates.render({
    kind: 'account.credentials',
    recipient: 'student@example.mg',
    temporaryPassword: 'TempPassword123!',
    activationToken: 'token-cred-123',
    locale: 'fr',
  })

  assert.equal(fr.to, 'student@example.mg')
  assert.equal(fr.subject, 'Votre accès à CoFound.mg')
  assert.match(fr.text, /student@example\.mg/)
  assert.match(fr.text, /TempPassword123!/)
  assert.match(fr.text, /token-cred-123/)
  assert.match(fr.html, /TempPassword123!/)
  assert.match(fr.html, /token-cred-123/)
})
