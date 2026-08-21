import { Injectable } from '@nestjs/common'
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

const DEFAULT_REMINDER_DAYS = 3
const REMINDER_TYPE = 'APPLICATION_REMINDER'

@Injectable()
export class ApplicationReminderService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | undefined

  onModuleInit(): void {
    if (process.env.APPLICATION_REMINDER_ENABLED === 'false') return
    const intervalMs = Number(process.env.APPLICATION_REMINDER_INTERVAL_MS ?? 900_000)
    this.timer = setInterval(() => {
      void this.runOnce().catch((error: unknown) => {
        console.error('[application-reminder] scan failed', error)
      })
    }, intervalMs)
    this.timer.unref()
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = undefined
  }
  constructor(private readonly prisma: PrismaService) {}

  async runOnce(now = new Date()): Promise<{ created: number; skipped: number }> {
    const thresholdDays = Number(process.env.APPLICATION_REMINDER_DAYS ?? DEFAULT_REMINDER_DAYS)
    const threshold = new Date(now.getTime() - thresholdDays * 24 * 60 * 60 * 1000)
    const pending = await this.prisma.application.findMany({
      where: { status: 'PENDING', createdAt: { lte: threshold } },
      include: { project: { include: { createdBy: true } } },
    })

    const ownerIds = [...new Set(pending.map((application) => application.project.createdById))]
    if (ownerIds.length === 0) return { created: 0, skipped: 0 }

    const existing = await this.prisma.notification.findMany({
      where: { userId: { in: ownerIds }, type: REMINDER_TYPE },
      select: { userId: true, payload: true, createdAt: true },
    })
    const existingKeys = new Set(
      existing.map((notification) => {
        const payload = notification.payload as { projectId?: string }
        return `${notification.userId}:${payload.projectId ?? ''}`
      }),
    )

    const byOwner = new Map<string, { projectId: string; projectTitle: string; count: number }>()
    for (const application of pending) {
      const ownerId = application.project.createdById
      const current = byOwner.get(ownerId)
      if (current) current.count += 1
      else byOwner.set(ownerId, {
        projectId: application.projectId,
        projectTitle: application.project.title,
        count: 1,
      })
    }

    let created = 0
    let skipped = 0
    for (const [ownerId, summary] of byOwner) {
      const key = `${ownerId}:${summary.projectId}`
      if (existingKeys.has(key)) {
        skipped += 1
        continue
      }
      await this.prisma.notification.create({
        data: {
          userId: ownerId,
          type: REMINDER_TYPE,
          payload: {
            projectId: summary.projectId,
            projectTitle: summary.projectTitle,
            pendingCount: summary.count,
            thresholdDays,
            deepLink: `/projects/${summary.projectId}/applications`,
          },
        },
      })
      created += 1
    }
    return { created, skipped }
  }
}
