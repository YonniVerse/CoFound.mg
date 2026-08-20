import pino from 'pino'
import type { LoggerService } from '@nestjs/common'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  base: {
    service: 'cofound-api',
    environment: process.env.NODE_ENV ?? 'development',
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'activationToken',
      'resetToken',
    ],
    censor: '[Redacted]',
  },
})

function messageText(message: unknown): string {
  if (typeof message === 'string') return message
  if (message instanceof Error) return message.stack ?? message.message
  try {
    return JSON.stringify(message) ?? String(message)
  } catch {
    return String(message)
  }
}

export const nestLogger: LoggerService = {
  log(message: unknown, context?: string) {
    logger.info({ context }, messageText(message))
  },
  error(message: unknown, trace?: string, context?: string) {
    logger.error({ context, trace }, messageText(message))
  },
  warn(message: unknown, context?: string) {
    logger.warn({ context }, messageText(message))
  },
  debug(message: unknown, context?: string) {
    logger.debug({ context }, messageText(message))
  },
  verbose(message: unknown, context?: string) {
    logger.trace({ context }, messageText(message))
  },
}
