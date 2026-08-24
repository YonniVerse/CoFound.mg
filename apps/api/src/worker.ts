import { startNotificationsWorker } from './notifications/notifications.worker.js'
import { startPersonalDataExportWorker } from './privacy/personal-data-export.worker.js'

const notificationWorker = await startNotificationsWorker()
const personalDataExportWorker = await startPersonalDataExportWorker()

const shutdown = async (signal: string) => {
  console.info(`[worker] received ${signal}, stopping gracefully`)
  await notificationWorker.stop()
  await personalDataExportWorker.stop()
  process.exit(0)
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))

console.info(`[worker] notifications worker started (${notificationWorker.workId})`)
console.info(`[worker] personal data export worker started (${personalDataExportWorker.workId})`)
