import { BadRequestException, Injectable, NotFoundException, Optional, Inject } from '@nestjs/common'
import { moderationDecisionSchema, moderationQueueQuerySchema, reportCreateSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'
import { NotificationService } from '../notifications/notification.service.js'

@Injectable()
export class ReportService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Optional() @Inject(NotificationService) private readonly notifications?: NotificationService, @Optional() @Inject(AuditService) private readonly audit?: AuditService) {}

  async create(reporterId: string, input: unknown) {
    const parsed = reportCreateSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    return this.prisma.$transaction(async (tx) => tx.report.create({
      data: { reporterId, targetType: parsed.data.targetType, targetId: parsed.data.targetId, reason: parsed.data.reason, description: parsed.data.description ?? null },
      select: { id: true, targetType: true, targetId: true, reason: true, status: true },
    }))
  }

  async list(input: unknown) {
    const parsed = moderationQueueQuerySchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const { status, cursor, limit } = parsed.data
    const rows = await this.prisma.report.findMany({
      where: { status },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      take: limit + 1,
      select: { id: true, targetType: true, targetId: true, reason: true, description: true, status: true, priority: true, createdAt: true, assignedToId: true },
    })
    const hasMore = rows.length > limit
    const items = hasMore ? rows.slice(0, limit) : rows
    return { items, nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null, hasMore }
  }

  async decide(actorId: string, reportId: string, input: unknown) {
    const parsed = moderationDecisionSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const { status, action, targetUserId, reason, durationDays } = parsed.data
    if (action && (!targetUserId || !reason)) throw new BadRequestException({ code: 'MODERATION_ACTION_DETAILS_REQUIRED', messageKey: 'errors.moderationActionDetailsRequired' })
    const result = await this.prisma.$transaction(async (tx) => {
      const current = await tx.report.findUnique({ where: { id: reportId } })
      if (!current) throw new NotFoundException({ code: 'REPORT_NOT_FOUND', messageKey: 'errors.notFound' })
      if (current.status === 'RESOLVED' || current.status === 'DISMISSED') throw new BadRequestException({ code: 'REPORT_ALREADY_RESOLVED', messageKey: 'errors.reportAlreadyResolved' })
      if (action && targetUserId) {
        const target = await tx.user.findUnique({ where: { id: targetUserId }, select: { id: true } })
        if (!target) throw new NotFoundException({ code: 'TARGET_USER_NOT_FOUND', messageKey: 'errors.notFound' })
        await tx.moderationAction.create({ data: { reportId, actorId, targetUserId, action, reason: reason!, durationDays: durationDays ?? null } })
        if (action === 'FREEZE' || action === 'DISABLE') await tx.user.update({ where: { id: targetUserId }, data: { status: action === 'FREEZE' ? 'FROZEN' : 'DISABLED' } })
      }
      return tx.report.update({
        where: { id: reportId },
        data: { status, assignedToId: actorId, resolvedAt: status === 'RESOLVED' || status === 'DISMISSED' ? new Date() : null },
        select: { id: true, reporterId: true, status: true, targetType: true, targetId: true, assignedToId: true, resolvedAt: true },
      })
    })
    if (result.status === 'RESOLVED' || result.status === 'DISMISSED') await this.notifyReporter(result)
    return result
  }

  async resolve(actorId: string, reportId: string, input: unknown) {
    return this.decide(actorId, reportId, input)
  }

  async revealIdentity(actorId: string, reportId: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId }, select: { id: true, targetType: true, targetId: true, reason: true } })
    if (!report) throw new NotFoundException({ code: 'REPORT_NOT_FOUND', messageKey: 'errors.notFound' })
    const targetUserId = await this.findTargetUserId(report.targetType, report.targetId)
    if (!targetUserId) throw new NotFoundException({ code: 'REPORT_TARGET_NOT_FOUND', messageKey: 'errors.notFound' })
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, email: true, talentIdentity: { select: { firstName: true, lastName: true } } } })
    if (!user?.talentIdentity) throw new NotFoundException({ code: 'IDENTITY_NOT_FOUND', messageKey: 'errors.notFound' })
    const identity = { userId: user.id, email: user.email, firstName: user.talentIdentity.firstName, lastName: user.talentIdentity.lastName, reason: report.reason, accessedAt: new Date() }
    await this.audit?.record({ actorId, action: 'MODERATION_IDENTITY_REVEALED', targetType: 'Report', targetId: report.id, metadata: { targetUserId } })
    return identity
  }

  private async notifyReporter(report: { id: string; reporterId: string; status: string }) {
    if (!this.notifications) return
    const reporter = await this.prisma.user.findUnique({ where: { id: report.reporterId }, select: { id: true, email: true, locale: true, talentProfile: { select: { pseudonym: true } } } })
    if (!reporter) return
    await this.notifications.notifyBusinessEvent({ userId: reporter.id, recipient: reporter.email, displayName: reporter.talentProfile?.pseudonym ?? 'Membre', type: 'report.resolved', referenceId: report.id, payload: { reportId: report.id, status: report.status }, locale: reporter.locale === 'mg' ? 'mg' : 'fr' })
  }

  private async findTargetUserId(targetType: string, targetId: string): Promise<string | null> {
    if (targetType === 'PROFILE') return (await this.prisma.talentProfile.findUnique({ where: { id: targetId }, select: { userId: true } }))?.userId ?? null
    if (targetType === 'MESSAGE') return (await this.prisma.message.findUnique({ where: { id: targetId }, select: { authorId: true } }))?.authorId ?? null
    if (targetType === 'PROJECT') return (await this.prisma.project.findUnique({ where: { id: targetId }, select: { createdById: true } }))?.createdById ?? null
    if (targetType === 'POST') return (await this.prisma.post.findUnique({ where: { id: targetId }, select: { author: { select: { userId: true } } } }))?.author.userId ?? null
    return null
  }
}
