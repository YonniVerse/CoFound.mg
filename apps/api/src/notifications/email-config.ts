export type EmailConfig = {
  domain: string
  from: string
  webhookSecret?: string
}

export function readEmailConfig(env: NodeJS.ProcessEnv = process.env): EmailConfig {
  const domain = env.EMAIL_DOMAIN?.trim() || 'cofound.mg'
  const from = env.EMAIL_FROM?.trim() || `no-reply@${domain}`
  if (!from.includes('@')) throw new Error('EMAIL_FROM must be a valid email address')
  return { domain, from, webhookSecret: env.EMAIL_WEBHOOK_SECRET?.trim() || undefined }
}

export function assertEmailDeliveryConfig(env: NodeJS.ProcessEnv = process.env): EmailConfig {
  const config = readEmailConfig(env)
  if (!config.webhookSecret || config.webhookSecret.length < 32) {
    throw new Error('EMAIL_WEBHOOK_SECRET must contain at least 32 characters')
  }
  return config
}
