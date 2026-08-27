import { Injectable, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class BlockService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) return { blocked: false, blockedId }
    try {
      await this.prisma.block.create({ data: { blockerId, blockedId } })
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error
    }
    return { blocked: true, blockedId }
  }

  async remove(blockerId: string, blockedId: string) {
    await this.prisma.block.deleteMany({ where: { blockerId, blockedId } })
    return { blocked: false, blockedId }
  }

  list(blockerId: string) {
    return this.prisma.block.findMany({ where: { blockerId }, select: { blockedId: true, createdAt: true }, orderBy: { createdAt: 'desc' } })
  }
}

