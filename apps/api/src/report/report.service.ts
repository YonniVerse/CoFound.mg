import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common'
import { reportCreateSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { NotificationService } from '../notifications/notification.service.js'

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService, @Optional() private readonly notifications?: NotificationService) {}

  async create(reporterId: string, input: unknown) {
    const parsed = reportCreateSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    return this.prisma.$transaction(async (tx) => tx.report.create({
      data: { reporterId, targetType: parsed.data.targetType, targetId: parsed.data.targetId, reason: parsed.data.reason, description: parsed.data.description ?? null },
      select: { id: true, targetType: true, targetId: true, reason: true, status: true },
    }))
  }

  async resolve(actorId: string, reportId: string, input: unknown) {
    const requestedStatus = typeof input === 'object' && input !== null && 'status' in input ? input.status : undefined
    const status = requestedStatus === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED'
    const report = await this.prisma.$transaction(async (tx) => {
      const current = await tx.report.findUnique({ where: { id: reportId } })
      if (!current) throw new NotFoundException({ code: 'REPORT_NOT_FOUND', messageKey: 'errors.notFound' })
      if (current.status === 'RESOLVED' || current.status === 'DISMISSED') throw new BadRequestException({ code: 'REPORT_ALREADY_RESOLVED', messageKey: 'errors.reportAlreadyResolved' })
      return tx.report.update({ where: { id: reportId }, data: { status, assignedToId: actorId, resolvedAt: new Date() }, select: { id: true, reporterId: true, status: true, targetType: true, targetId: true } })
    })
    const reporter = await this.prisma.user.findUnique({ where: { id: report.reporterId }, select: { id: true, email: true, locale: true, talentProfile: { select: { pseudonym: true } } } })
    if (reporter && this.notifications) {
      await this.notifications.notifyBusinessEvent({
        userId: reporter.id,
        recipient: reporter.email,
        displayName: reporter.talentProfile?.pseudonym ?? 'Membre',
        type: 'report.resolved',
        referenceId: report.id,
        payload: { reportId: report.id, status: report.status },
        locale: reporter.locale === 'mg' ? 'mg' : 'fr',
      })
    }
    return report
  }
}
