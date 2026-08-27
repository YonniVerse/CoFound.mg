import { ForbiddenException, Injectable, NotFoundException, Optional, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { NotificationService } from '../notifications/notification.service.js'

@Injectable()
export class ConnectionService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Optional() @Inject(NotificationService) private readonly notifications?: NotificationService) {}

  async acceptRequest(userId: string, requestId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const request = await tx.connectionRequest.findUnique({ where: { id: requestId } })
      if (!request || request.toUserId !== userId) throw new ForbiddenException({ code: 'CONTACT_REQUEST_ACCESS_DENIED', messageKey: 'errors.contactRequestAccessDenied' })
      if (request.status === 'DECLINED' || request.status === 'EXPIRED') throw new NotFoundException({ code: 'CONTACT_REQUEST_NOT_ACTIONABLE', messageKey: 'errors.contactRequestNotActionable' })
      const pair = [request.fromUserId, request.toUserId].sort()
      const userAId = pair[0]!
      const userBId = pair[1]!
      const connection = await tx.connection.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        create: { userAId, userBId, source: 'MATCH' },
        update: {},
      })
      await tx.connectionRequest.update({ where: { id: request.id }, data: { status: 'ACCEPTED' } })
      return { connection, recipientId: request.fromUserId }
    })

    const recipient = this.prisma.user ? await this.prisma.user.findUnique({ where: { id: result.recipientId }, select: { email: true, locale: true, talentProfile: { select: { pseudonym: true } } } }) : null
    if (recipient && this.notifications) {
      await this.notifications.notifyBusinessEvent({
        userId: result.recipientId,
        recipient: recipient.email,
        displayName: recipient.talentProfile?.pseudonym ?? 'Membre',
        type: 'connection.accepted',
        referenceId: result.connection.id,
        payload: { connectionId: result.connection.id },
        locale: recipient.locale === 'mg' ? 'mg' : 'fr',
      })
    }
    return result.connection
  }

  async list(userId: string) { return this.prisma.connection.findMany({ where: { OR: [{ userAId: userId }, { userBId: userId }] }, orderBy: { createdAt: 'desc' } }) }

  async get(userId: string, id: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id } })
    if (!connection || (connection.userAId !== userId && connection.userBId !== userId)) throw new ForbiddenException({ code: 'CONNECTION_ACCESS_DENIED', messageKey: 'errors.connectionAccessDenied' })
    return connection
  }
}
