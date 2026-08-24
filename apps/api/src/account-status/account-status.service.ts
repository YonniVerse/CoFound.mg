import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

const messageKeys = {
  ACTIVE: 'account.status.active',
  FROZEN: 'account.status.frozen',
  LEAVING: 'account.status.leaving',
  ALUMNI: 'account.status.alumni',
  INVITED: 'account.status.invited',
  DISABLED: 'account.status.disabled',
} as const

@Injectable()
export class AccountStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { status: true } })
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', messageKey: 'errors.notFound' })
    return { status: user.status, messageKey: messageKeys[user.status], canAppeal: user.status === 'FROZEN', endsAt: null }
  }
}
