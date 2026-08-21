import { ForbiddenException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { ConversationMessageCreateInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

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

  list(userId: string) {
    return this.prisma.conversation.findMany({ where: { participants: { some: { userId } } }, orderBy: { createdAt: 'desc' } })
  }

  private async assertParticipant(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId } } })
    if (!participant) throw new ForbiddenException({ code: 'CONVERSATION_ACCESS_DENIED', messageKey: 'errors.conversationAccessDenied' })
  }

  async messages(userId: string, conversationId: string) {
    await this.assertParticipant(userId, conversationId)
    const rows = await this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' }, include: { author: { select: { talentProfile: { select: { pseudonym: true } } } } } })
    return rows.map(({ author, ...message }) => ({ ...message, authorPseudonym: author.talentProfile?.pseudonym ?? 'Membre' }))
  }

  async send(userId: string, conversationId: string, input: ConversationMessageCreateInput) {
    await this.assertParticipant(userId, conversationId)
    const row = await this.prisma.message.create({ data: { conversationId, authorId: userId, body: input.body, attachmentKey: input.attachmentKey ?? null }, include: { author: { select: { talentProfile: { select: { pseudonym: true } } } } } })
    const { author, ...message } = row
    return { ...message, authorPseudonym: author.talentProfile?.pseudonym ?? 'Membre' }
  }
}
