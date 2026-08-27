import { Injectable, Inject } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { auditLogQuerySchema, type AuditLogQuery, type AuditLogResponse } from '@cofound/shared'
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

const SAFE_METADATA_KEYS = new Set([
  'method', 'path', 'status', 'reasonCode', 'reportId', 'applicationId', 'connectionId',
  'projectId', 'organizationId', 'targetType', 'targetId', 'durationDays', 'action', 'decision',
])

@Injectable()
export class AuditService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

  async list(input: unknown): Promise<AuditLogResponse> {
    const query = auditLogQuerySchema.parse(input) as AuditLogQuery
    const where: Prisma.AuditLogWhereInput = {}
    if (query.actorId) where.actorId = query.actorId
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' }
    if (query.targetType) where.targetType = { equals: query.targetType, mode: 'insensitive' }
    if (query.from || query.to) where.createdAt = { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lte: query.to } : {}) }
    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      take: query.limit + 1,
      select: { id: true, createdAt: true, actorId: true, actorRole: true, action: true, targetType: true, targetId: true, ip: true, metadata: true },
    })
    const hasMore = rows.length > query.limit
    const items = (hasMore ? rows.slice(0, query.limit) : rows).map((row) => ({
      ...row,
      metadata: this.sanitizeMetadata(row.metadata),
    }))
    return { items, nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null, hasMore }
  }

  private sanitizeMetadata(metadata: Prisma.JsonValue | null): Record<string, unknown> | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
    return Object.fromEntries(Object.entries(metadata).filter(([key]) => SAFE_METADATA_KEYS.has(key)))
  }
}
