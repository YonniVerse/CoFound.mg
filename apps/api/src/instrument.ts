import { setDefaultResultOrder } from 'node:dns'
import { setDefaultAutoSelectFamily } from 'node:net'
import * as Sentry from '@sentry/nestjs'

setDefaultResultOrder('ipv4first')
if (typeof setDefaultAutoSelectFamily === 'function') {
  setDefaultAutoSelectFamily(false)
}

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
  })
}

