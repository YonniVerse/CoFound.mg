import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { EmailTemplateService } from '../src/notifications/email-template.service.js'

test('E-02 rend les gabarits d’activation en français et en malgache', () => {
  const templates = new EmailTemplateService()
  const fr = templates.render({ kind: 'account.activation', recipient: 'fara@example.mg', activationToken: 'token-fr', locale: 'fr' })
  const mg = templates.render({ kind: 'account.activation', recipient: 'fara@example.mg', activationToken: 'token-mg', locale: 'mg' })

  assert.equal(fr.to, 'fara@example.mg')
  assert.match(fr.subject, /Activez votre compte/)
  assert.match(fr.text, /token-fr/)
  assert.match(mg.subject, /kaontinao/)
  assert.match(mg.html, /token-mg/)
})
