import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { MIN_AGGREGATION_THRESHOLD } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class ProductHealthService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const [invited, activated, completion, projects, matches, applications, reports, bounces, invitations] = await Promise.all([
      this.prisma.user.count({ where: { status: { in: ['INVITED', 'ACTIVE', 'FROZEN', 'DISABLED'] } } }),
      this.prisma.user.count({ where: { activatedAt: { not: null } } }),
      this.prisma.talentProfile.aggregate({ _avg: { completion: true }, _count: { _all: true } }),
      this.prisma.project.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.connectionRequest.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.application.count(),
      this.prisma.report.count(),
      this.prisma.importRow.count({ where: { result: 'BOUNCED' } }),
      this.prisma.invitationToken.count(),
    ])
    const [responseMedian, moderationMedian] = await Promise.all([
      this.prisma.$queryRaw<Array<{ median: number | null }>>(Prisma.sql`SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM ("decidedAt" - "createdAt")) / 3600) AS median FROM "Application" WHERE "decidedAt" IS NOT NULL`),
      this.prisma.$queryRaw<Array<{ median: number | null }>>(Prisma.sql`SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600) AS median FROM "Report" WHERE "resolvedAt" IS NOT NULL`),
    ])
    const projectMap = Object.fromEntries(projects.map((row) => [row.status, row._count._all]))
    const matchMap = Object.fromEntries(matches.map((row) => [row.status, row._count._all]))
    return {
      generatedAt: new Date(),
      threshold: MIN_AGGREGATION_THRESHOLD,
      activation: { invited: this.hideCount(invited), activated: this.hideCount(activated), rate: this.safeRate(activated, invited) },
      profileCompletionAverage: this.hideAverage(completion._avg.completion, completion._count._all),
      projectsByStatus: projectMap,
      acceptedMatchRate: this.safeRate(matchMap.ACCEPTED ?? 0, Object.values(matchMap).reduce((total, value) => total + value, 0)),
      applicationResponseMedianHours: responseMedian[0]?.median ?? null,
      moderation: { volume: this.hideCount(reports), medianResolutionHours: moderationMedian[0]?.median ?? null },
      invitationBounceRate: this.safeRate(bounces, invitations),
      applicationsObserved: this.hideCount(applications),
    }
  }

  private hideCount(value: number) { return value < MIN_AGGREGATION_THRESHOLD ? null : value }
  private hideAverage(value: number | null, population: number) { return population < MIN_AGGREGATION_THRESHOLD || value === null ? null : Math.round(value * 10) / 10 }
  private safeRate(numerator: number, denominator: number) { return denominator < MIN_AGGREGATION_THRESHOLD ? null : Math.round((numerator / denominator) * 1000) / 10 }
}
