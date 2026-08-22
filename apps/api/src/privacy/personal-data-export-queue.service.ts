import { Injectable } from '@nestjs/common'
import { PgBoss } from 'pg-boss'
import { PERSONAL_DATA_EXPORT_QUEUE, type PersonalDataExportJob } from './personal-data-export-job.js'

@Injectable()
export class PersonalDataExportQueueService {
  private boss: PgBoss | null = null
  private initialization: Promise<void> | null = null

  async enqueue(job: PersonalDataExportJob): Promise<string | null> {
    await this.initialize()
    if (!this.boss) throw new Error('DATABASE_URL is required to enqueue personal data exports')
    return this.boss.send(PERSONAL_DATA_EXPORT_QUEUE, job, { retryLimit: 3, retryDelay: 60 })
  }

  async close() { if (this.boss) await this.boss.stop() }

  private async initialize() {
    if (this.boss) return
    if (this.initialization) return this.initialization
    this.initialization = this.start()
    try { await this.initialization } finally { this.initialization = null }
  }

  private async start() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) return
    const boss = new PgBoss(connectionString)
    boss.on('error', (error) => console.error('[pg-boss] personal export queue error', error))
    await boss.start()
    await boss.createQueue(PERSONAL_DATA_EXPORT_QUEUE)
    this.boss = boss
  }
}
