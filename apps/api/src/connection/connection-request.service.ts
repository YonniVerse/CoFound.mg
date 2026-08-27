import { BadRequestException, ConflictException, ForbiddenException, Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { ContactRequestCreateInput, ContactRequestDecisionInput } from '@cofound/shared'

@Injectable()
export class ConnectionRequestService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(fromUserId: string, input: ContactRequestCreateInput) {
    if (fromUserId === input.toUserId) throw new BadRequestException({ code: 'SELF_CONTACT_REQUEST', messageKey: 'errors.selfContactRequest' })
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.connectionRequest.findFirst({ where: { fromUserId, toUserId: input.toUserId, status: 'PENDING' } })
      if (existing) return existing
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const quota = await tx.connectionRequest.count({ where: { fromUserId, createdAt: { gte: since } } })
      if (quota >= 5) throw new ConflictException({ code: 'CONTACT_QUOTA_EXCEEDED', messageKey: 'errors.contactQuotaExceeded' })
      return tx.connectionRequest.create({ data: { fromUserId, toUserId: input.toUserId, message: input.message } })
    })
  }

  listIncoming(userId: string) {
    return this.prisma.connectionRequest.findMany({ where: { toUserId: userId }, orderBy: { createdAt: 'desc' } })
  }

  async decide(userId: string, id: string, input: ContactRequestDecisionInput) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.connectionRequest.findUnique({ where: { id } })
      if (!request || request.toUserId !== userId) throw new ForbiddenException({ code: 'CONTACT_REQUEST_ACCESS_DENIED', messageKey: 'errors.contactRequestAccessDenied' })
      if (request.status !== 'PENDING') return request
      return tx.connectionRequest.update({ where: { id }, data: { status: input.decision } })
    })
  }
}
