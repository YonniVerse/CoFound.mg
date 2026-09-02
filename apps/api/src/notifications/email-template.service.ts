import { Injectable } from '@nestjs/common'
import type { NotificationJob } from './notification-job.js'

export type RenderedEmail = {
  from: string
  to: string
  subject: string
  text: string
  html: string
}

@Injectable()
export class EmailTemplateService {
  render(job: NotificationJob, from = process.env.EMAIL_FROM ?? 'no-reply@cofound.mg'): RenderedEmail {
    if (job.kind === 'account.activation') {
      const copy = job.locale === 'mg'
        ? { subject: 'Manasa ny kaontinao CoFound.mg', intro: 'Nomena kaonty CoFound.mg ianao.', action: 'Hampihetsika ny kaontiko' }
        : { subject: 'Activez votre compte CoFound.mg', intro: 'Un établissement vous a invité à rejoindre CoFound.mg.', action: 'Activer mon compte' }
      const link = `${process.env.APP_URL ?? 'http://localhost:5173'}/activation/${job.activationToken}`
      return this.rendered(from, job.recipient, copy.subject, copy.intro, copy.action, link)
    }

    if (job.kind === 'account.credentials') {
      const copy = job.locale === 'mg'
        ? {
            subject: 'Ny kaontinao sy tenimiafina CoFound.mg',
            intro: `Nomena kaonty CoFound.mg ianao.\nIdentifiant: ${job.recipient}\nTenimiafina vonjimaika: ${job.temporaryPassword}`,
            action: 'Hampihetsika ny kaontiko',
          }
        : {
            subject: 'Vos identifiants d’accès CoFound.mg',
            intro: `Un établissement vous a créé un compte CoFound.mg.\nIdentifiant (email): ${job.recipient}\nMot de passe temporaire: ${job.temporaryPassword}`,
            action: 'Activer mon compte et personnaliser le mot de passe',
          }
      const link = `${process.env.APP_URL ?? 'http://localhost:5173'}/activation/${job.activationToken}`
      return this.rendered(from, job.recipient, copy.subject, copy.intro, copy.action, link)
    }


    if (job.kind === 'password.reset') {
      const copy = job.locale === 'mg'
        ? { subject: 'Avereno ny tenimiafina CoFound.mg', intro: 'Nangataka famerenana tenimiafina ianao.', action: 'Hanavao ny tenimiafina' }
        : { subject: 'Réinitialisez votre mot de passe CoFound.mg', intro: 'Vous avez demandé la réinitialisation de votre mot de passe.', action: 'Réinitialiser mon mot de passe' }
      const link = `${process.env.APP_URL ?? 'http://localhost:5173'}/password-reset/${job.resetToken}`
      return this.rendered(from, job.recipient, copy.subject, copy.intro, copy.action, link)
    }

    const labels = {
      'connection.accepted': ['Connexion confirmée', 'Votre mise en relation a été acceptée.'],
      'message.received': ['Nouveau message', 'Vous avez reçu un nouveau message.'],
      'application.accepted': ['Candidature acceptée', 'Votre candidature a été acceptée.'],
      'report.resolved': ['Signalement traité', 'La décision concernant votre signalement est disponible.'],
    } as const
    const [subject, intro] = labels[job.kind]
    const localized = job.locale === 'mg' ? { subject: `CoFound.mg: ${subject}`, intro: `Misy vaovao momba ny hetsikao: ${job.displayName}.`, action: 'Hijery ny CoFound.mg' } : { subject, intro: `${intro} Référence ${job.displayName}.`, action: 'Ouvrir CoFound.mg' }
    const link = `${process.env.APP_URL ?? 'http://localhost:5173'}/notifications/${job.referenceId}`
    return this.rendered(from, job.recipient, localized.subject, localized.intro, localized.action, link)
  }

  private rendered(from: string, to: string, subject: string, intro: string, action: string, link: string): RenderedEmail {
    return {
      from,
      to,
      subject,
      text: `${intro}\n\n${action}: ${link}\n\nCe lien est personnel et expire selon la politique de CoFound.mg.`,
      html: `<p>${intro}</p><p><a href="${link}">${action}</a></p><p>Ce lien est personnel et expirant.</p>`,
    }
  }
}
