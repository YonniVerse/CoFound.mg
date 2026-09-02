import { PgBoss } from 'pg-boss'
import { NOTIFICATION_QUEUE, type NotificationJob } from './notification-job.js'
import { SmtpNotificationTransport } from './smtp-transport.js'

export interface NotificationTransport {
  deliver(job: NotificationJob): Promise<void>
}

export type NotificationsWorker = {
  boss: PgBoss
  workId: string
  stop: () => Promise<void>
}

export async function startNotificationsWorker(
  transport: NotificationTransport = new SmtpNotificationTransport(),
): Promise<NotificationsWorker> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required to start the notifications worker')

  const boss = new PgBoss(connectionString)
  boss.on('error', (error) => console.error('[pg-boss] worker error', error))
  await boss.start()
  await boss.createQueue(NOTIFICATION_QUEUE)

  const workId = await boss.work<NotificationJob>(NOTIFICATION_QUEUE, async ([job]) => {
    if (!job) return
    await transport.deliver(job.data)
  })

  return {
    boss,
    workId,
    stop: () => boss.stop(),
  }
}
