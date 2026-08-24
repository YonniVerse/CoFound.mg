export const NOTIFICATION_QUEUE = 'cofound.notifications.email'

export type NotificationLocale = 'fr' | 'mg'

export type ActivationEmailJob = {
  kind: 'account.activation'
  recipient: string
  activationToken: string
  locale: NotificationLocale
}

export type PasswordResetEmailJob = {
  kind: 'password.reset'
  recipient: string
  resetToken: string
  locale: NotificationLocale
}

export type BusinessEmailJob = {
  kind: 'connection.accepted' | 'message.received' | 'application.accepted' | 'report.resolved'
  recipient: string
  displayName: string
  locale: NotificationLocale
  referenceId: string
}

export type NotificationJob = ActivationEmailJob | PasswordResetEmailJob | BusinessEmailJob
