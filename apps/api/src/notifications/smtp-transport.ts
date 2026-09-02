import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import type { NotificationJob } from './notification-job.js'
import { EmailTemplateService } from './email-template.service.js'
import type { NotificationTransport } from './notifications.worker.js'

export class SmtpNotificationTransport implements NotificationTransport {
  private transporter: Transporter | null = null
  private readonly templates = new EmailTemplateService()

  constructor() {
    const host = process.env.SMTP_HOST?.trim()
    const port = Number(process.env.SMTP_PORT ?? 587)
    const user = process.env.SMTP_USER?.trim()
    const pass = process.env.SMTP_PASSWORD?.trim() || process.env.SMTP_PASS?.trim()

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      })
    }
  }

  async deliver(job: NotificationJob): Promise<void> {
    const email = this.templates.render(job)
    if (this.transporter) {
      await this.transporter.sendMail({
        from: email.from,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      })
      console.info('[notification] email sent via SMTP', { recipient: email.to, subject: email.subject })
    } else {
      console.info('[notification] email rendered (SMTP not configured, fallback to console)', {
        kind: job.kind,
        locale: job.locale,
        recipient: email.to,
        subject: email.subject,
      })
    }
  }
}
