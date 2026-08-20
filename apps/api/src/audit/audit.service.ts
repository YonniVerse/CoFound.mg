import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'

export type AuditEvent = {
  actorId?: string
  actorRole?: string
  action: string
  targetType: string
  targetId: string
  metadata?: Prisma.InputJsonValue
  ip?: string
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(event: AuditEvent): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: event.actorId,
        actorRole: event.actorRole,
        action: event.action,
        targetType: event.targetType,
        targetId: event.targetId,
        metadata: event.metadata,
        ip: event.ip,
      },
    })
  }
}
