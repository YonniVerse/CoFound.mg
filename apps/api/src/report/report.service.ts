import { BadRequestException, Injectable } from '@nestjs/common'
import { reportCreateSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, input: unknown) {
    const parsed = reportCreateSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const report = await this.prisma.$transaction(async (tx) => tx.report.create({
      data: {
        reporterId,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId,
        reason: parsed.data.reason,
        description: parsed.data.description ?? null,
      },
      select: { id: true, targetType: true, targetId: true, reason: true, status: true },
    }))
    return report
  }
}
