import { Injectable } from '@nestjs/common'
import type { NotificationJob } from './notification-job.js'

export type RenderedEmail = {
  from: string
  to: string
  subject: string
  text: string
  html: string
}

function getBaseUrl(): string {
  return process.env.APP_URL || process.env.WEB_APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
}

function getDefaultFrom(): string {
  const address = process.env.MAIL_FROM?.trim() || process.env.EMAIL_FROM?.trim() || 'no-reply@cofound.mg'
  const name = process.env.MAIL_FROM_NAME?.trim() || 'CoFound.mg'
  return name ? `"${name}" <${address}>` : address
}

@Injectable()
export class EmailTemplateService {
  render(job: NotificationJob, customFrom?: string): RenderedEmail {
    const from = customFrom || getDefaultFrom()
    const baseUrl = getBaseUrl()

    if (job.kind === 'account.activation') {
      const isMg = job.locale === 'mg'
      const subject = isMg ? 'Manasa ny kaontinao CoFound.mg' : 'Votre accès à CoFound.mg — Activation de compte'
      const link = `${baseUrl}/activation/${job.activationToken}`

      const text = isMg
        ? `Manao ahoana,\n\nNomena kaonty CoFound.mg ianao.\n\nHampihetsika ny kaontinao: ${link}\n\nMankasitraka,\nNy ekipa CoFound.mg`
        : `Bonjour,\n\nVotre compte étudiant CoFound.mg a été créé par votre établissement.\n\nPour activer votre compte et accéder à la plateforme, veuillez cliquer sur le lien ci-dessous :\n${link}\n\nCe lien d’activation est personnel et valable pendant 30 jours.\n\nBienvenue sur CoFound.mg.`

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="margin-bottom: 20px;">
            <h1 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">CoFound.mg</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Plateforme nationale d'entrepreneuriat étudiant</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">${isMg ? 'Manao ahoana,' : 'Bonjour,'}</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            ${isMg ? 'Nomena kaonty CoFound.mg ianao.' : 'Votre compte étudiant CoFound.mg a été créé par votre établissement.'}
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${link}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 8px;">
              ${isMg ? 'Hampihetsika ny kaontiko' : 'Activer mon compte'}
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
            ${isMg ? 'Lien d\'activation:' : 'Lien direct si le bouton ne fonctionne pas:'}<br />
            <a href="${link}" style="color: #0284c7; word-break: break-all;">${link}</a>
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Ce lien est personnel et expirera sous 30 jours.
          </p>
        </div>
      `

      return { from, to: job.recipient, subject, text, html }
    }

    if (job.kind === 'account.credentials') {
      const isMg = job.locale === 'mg'
      const subject = isMg ? 'Ny kaontinao sy tenimiafina CoFound.mg' : 'Votre accès à CoFound.mg'
      const link = `${baseUrl}/activation/${job.activationToken}`

      const text = isMg
        ? `Manao ahoana,\n\nNomena kaonty CoFound.mg ianao.\n\nEmail: ${job.recipient}\nTenimiafina vonjimaika: ${job.temporaryPassword}\n\nHampihetsika ny kaontiko: ${link}\n\nManova ny tenimiafina aorian'ny fidirana voalohany.\n\nMankasitraka,\nNy ekipa CoFound.mg`
        : `Bonjour,\n\nVotre compte étudiant CoFound.mg a été créé.\n\nEmail :\n${job.recipient}\n\nMot de passe initial :\n${job.temporaryPassword}\n\nLien d’activation et de connexion :\n${link}\n\nAprès votre première connexion, nous vous recommandons de modifier votre mot de passe.\n\nBienvenue sur CoFound.mg.`

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="margin-bottom: 20px;">
            <h1 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">CoFound.mg</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Plateforme nationale d'entrepreneuriat étudiant</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">${isMg ? 'Manao ahoana,' : 'Bonjour,'}</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            ${isMg ? 'Nomena kaonty CoFound.mg ianao.' : 'Votre compte étudiant CoFound.mg a été créé par votre établissement.'}
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="font-size: 13px; font-weight: 600; color: #475569; margin: 0 0 4px 0;">Identifiant de connexion (email) :</p>
            <p style="font-family: monospace; font-size: 14px; color: #0f172a; margin: 0 0 12px 0;">${job.recipient}</p>
            <p style="font-size: 13px; font-weight: 600; color: #475569; margin: 0 0 4px 0;">Mot de passe temporaire :</p>
            <p style="font-family: monospace; font-size: 14px; color: #0f172a; margin: 0; background-color: #ffffff; padding: 6px 10px; border-radius: 4px; border: 1px solid #cbd5e1; display: inline-block;">${job.temporaryPassword}</p>
          </div>

          <div style="margin: 28px 0; text-align: center;">
            <a href="${link}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 8px;">
              ${isMg ? 'Hampihetsika ny kaontiko' : 'Activer mon compte'}
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Après votre première activation, nous vous recommandons de personnaliser votre mot de passe dans vos paramètres.
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Ce lien est personnel et expirera sous 30 jours.
          </p>
        </div>
      `

      return { from, to: job.recipient, subject, text, html }
    }

    if (job.kind === 'password.reset') {
      const isMg = job.locale === 'mg'
      const subject = isMg ? 'Avereno ny tenimiafina CoFound.mg' : 'Réinitialisez votre mot de passe CoFound.mg'
      const link = `${baseUrl}/password-reset/${job.resetToken}`

      const text = isMg
        ? `Manao ahoana,\n\nNangataka famerenana tenimiafina ianao.\n\nHanavao ny tenimiafina: ${link}\n\nMankasitraka,\nNy ekipa CoFound.mg`
        : `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe CoFound.mg.\n\nVeuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :\n${link}\n\nCe lien expire dans 1 heure.\n\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.`

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">CoFound.mg</h1>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            ${isMg ? 'Nangataka famerenana tenimiafina ianao.' : 'Vous avez demandé la réinitialisation de votre mot de passe.'}
          </p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${link}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 8px;">
              ${isMg ? 'Hanavao ny tenimiafina' : 'Réinitialiser mon mot de passe'}
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">
            Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez ce message.
          </p>
        </div>
      `

      return { from, to: job.recipient, subject, text, html }
    }

    const labels = {
      'connection.accepted': ['Connexion confirmée', 'Votre mise en relation a été acceptée.'],
      'message.received': ['Nouveau message', 'Vous avez reçu un nouveau message.'],
      'application.accepted': ['Candidature acceptée', 'Votre candidature a été acceptée.'],
      'report.resolved': ['Signalement traité', 'La décision concernant votre signalement est disponible.'],
    } as const

    const [subject, intro] = labels[job.kind]
    const localized =
      job.locale === 'mg'
        ? { subject: `CoFound.mg: ${subject}`, intro: `Misy vaovao momba ny hetsikao: ${job.displayName}.`, action: 'Hijery ny CoFound.mg' }
        : { subject, intro: `${intro} Référence ${job.displayName}.`, action: 'Ouvrir CoFound.mg' }
    const link = `${baseUrl}/notifications/${job.referenceId}`

    return {
      from,
      to: job.recipient,
      subject: localized.subject,
      text: `${localized.intro}\n\n${localized.action}: ${link}\n\nCe lien est personnel et expire selon la politique de CoFound.mg.`,
      html: `<p>${localized.intro}</p><p><a href="${link}">${localized.action}</a></p><p>Ce lien est personnel et expirant.</p>`,
    }
  }
}
