import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import { NotificationsQueueService } from './notifications-queue.service.js'
import type { BusinessEmailJob } from './notification-job.js'

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService, private readonly queue: NotificationsQueueService) {}

  async list(userId: string) {
    return await this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 })
  }

  async markRead(userId: string, id: string) {
    const result = await this.prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } })
    if (result.count === 0) throw new NotFoundException({ code: 'NOTIFICATION_NOT_FOUND', messageKey: 'errors.notFound' })
    return { id, read: true }
  }

  async create(userId: string, type: string, payload: Prisma.InputJsonValue) {
    return this.prisma.notification.create({ data: { userId, type, payload } })
  }

  async notifyBusinessEvent(input: { userId: string; recipient: string; type: BusinessEmailJob['kind']; displayName: string; referenceId: string; payload: Prisma.InputJsonValue; locale?: BusinessEmailJob['locale'] }) {
    return this.prisma.$transaction(async (transaction) => {
      const notification = await transaction.notification.create({ data: { userId: input.userId, type: input.type, payload: input.payload } })
      await this.queue.enqueue({ kind: input.type, recipient: input.recipient, displayName: input.displayName, referenceId: input.referenceId, locale: input.locale ?? 'fr' })
      return notification
    })
  }
}
