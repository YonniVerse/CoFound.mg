import { Injectable } from '@nestjs/common'
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PgBoss } from 'pg-boss'
import { NOTIFICATION_QUEUE, type NotificationJob } from './notification-job.js'

const RETRY_LIMIT = 5
const RETRY_DELAY_SECONDS = 30

@Injectable()
export class NotificationsQueueService implements OnModuleInit, OnModuleDestroy {
  private boss: PgBoss | null = null
  private initialization: Promise<void> | null = null

  async onModuleInit(): Promise<void> {
    await this.initialize()
  }

  async onModuleDestroy(): Promise<void> {
    if (this.boss) await this.boss.stop()
  }

  async enqueue(job: NotificationJob): Promise<string | null> {
    await this.initialize()
    if (!this.boss) throw new Error('DATABASE_URL is required to enqueue notifications')

    return this.boss.send(NOTIFICATION_QUEUE, job, {
      retryLimit: RETRY_LIMIT,
      retryDelay: RETRY_DELAY_SECONDS,
    })
  }

  private async initialize(): Promise<void> {
    if (this.boss) return
    if (this.initialization) return this.initialization

    this.initialization = this.startBoss()
    try {
      await this.initialization
    } finally {
      this.initialization = null
    }
  }

  private async startBoss(): Promise<void> {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) return

    const boss = new PgBoss(connectionString)
    boss.on('error', (error) => console.error('[pg-boss] notification queue error', error))
    await boss.start()
    await boss.createQueue(NOTIFICATION_QUEUE)
    this.boss = boss
  }
}
