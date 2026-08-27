import { ForbiddenException, Injectable, Optional, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { ConversationMessageCreateInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { NotificationService } from '../notifications/notification.service.js'

@Injectable()
export class MessagingService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Optional() @Inject(NotificationService) private readonly notifications?: NotificationService) {}

  async openDirect(userId: string, connectionId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const connection = await tx.connection.findUnique({ where: { id: connectionId } })
        if (!connection || (connection.userAId !== userId && connection.userBId !== userId)) throw new ForbiddenException({ code: 'CONNECTION_ACCESS_DENIED', messageKey: 'errors.connectionAccessDenied' })
        if (connection.conversationId) return tx.conversation.findUnique({ where: { id: connection.conversationId } })
        const otherUserId = connection.userAId === userId ? connection.userBId : connection.userAId
        const conversation = await tx.conversation.create({ data: { type: 'DIRECT', participants: { create: [{ userId }, { userId: otherUserId }] } } })
        await tx.connection.update({ where: { id: connection.id }, data: { conversationId: conversation.id } })
        return conversation
      })
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error
      const connection = await this.prisma.connection.findUnique({ where: { id: connectionId } })
      if (!connection?.conversationId) throw error
      return this.prisma.conversation.findUnique({ where: { id: connection.conversationId } })
    }
  }

  async openProject(userId: string, projectId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.projectMember.findFirst({ where: { projectId, userId, leftAt: null } })
      if (!member) throw new ForbiddenException({ code: 'PROJECT_CHANNEL_ACCESS_DENIED', messageKey: 'errors.projectChannelAccessDenied' })
      const existing = await tx.conversation.findUnique({ where: { projectId } })
      if (existing) return existing
      const members = await tx.projectMember.findMany({ where: { projectId, leftAt: null }, select: { userId: true } })
      if (members.length === 0) throw new ForbiddenException({ code: 'PROJECT_CHANNEL_ACCESS_DENIED', messageKey: 'errors.projectChannelAccessDenied' })
      return tx.conversation.create({ data: { type: 'PROJECT', projectId, participants: { create: members.map(({ userId: participantId }) => ({ userId: participantId })) } } })
    })
  }

  list(userId: string) { return this.prisma.conversation.findMany({ where: { participants: { some: { userId } } }, orderBy: { createdAt: 'desc' } }) }

  private async assertParticipant(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId } } })
    if (!participant) throw new ForbiddenException({ code: 'CONVERSATION_ACCESS_DENIED', messageKey: 'errors.conversationAccessDenied' })
  }

  async messages(userId: string, conversationId: string) {
    await this.assertParticipant(userId, conversationId)
    const rows = await this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' }, include: { author: { select: { talentProfile: { select: { pseudonym: true } } } } } })
    return { items: rows.map(({ author, ...message }) => ({ ...message, authorPseudonym: author.talentProfile?.pseudonym ?? 'Membre' })) }
  }

  async send(userId: string, conversationId: string, input: ConversationMessageCreateInput) {
    await this.assertParticipant(userId, conversationId)
    const row = await this.prisma.message.create({ data: { conversationId, authorId: userId, body: input.body, attachmentKey: input.attachmentKey ?? null }, include: { author: { select: { talentProfile: { select: { pseudonym: true } } } } } })
    const { author, ...message } = row
    const recipients = await this.prisma.conversationParticipant.findMany({ where: { conversationId, userId: { not: userId } }, select: { user: { select: { id: true, email: true, locale: true, talentProfile: { select: { pseudonym: true } } } } } })
    if (this.notifications) await Promise.all(recipients.map(({ user }) => this.notifications!.notifyBusinessEvent({
      userId: user.id,
      recipient: user.email,
      displayName: user.talentProfile?.pseudonym ?? 'Membre',
      type: 'message.received',
      referenceId: row.id,
      payload: { conversationId, messageId: row.id },
      locale: user.locale === 'mg' ? 'mg' : 'fr',
    })))
    return { ...message, authorPseudonym: author.talentProfile?.pseudonym ?? 'Membre' }
  }
}
