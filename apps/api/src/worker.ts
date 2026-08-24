import { startNotificationsWorker } from './notifications/notifications.worker.js'

const worker = await startNotificationsWorker()

const shutdown = async (signal: string) => {
  console.info(`[worker] received ${signal}, stopping gracefully`)
  await worker.stop()
  process.exit(0)
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))

console.info(`[worker] notifications worker started (${worker.workId})`)
