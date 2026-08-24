import { ForbiddenException, Injectable } from '@nestjs/common'
import { MIN_AGGREGATION_THRESHOLD } from '@cofound/shared'
import { OrganizationRole } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class InstitutionOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({ where: { userId, organization: { type: 'INSTITUTION' } }, include: { organization: true } })
    if (memberships.length === 0) throw new ForbiddenException({ code: 'FORBIDDEN', messageKey: 'institution.errors.notMember' })
    return { organizations: await Promise.all(memberships.map((membership) => this.organizationOverview(membership.organizationId, membership.role))) }
  }

  private async organizationOverview(organizationId: string, role: OrganizationRole) {
    const memberIds = (await this.prisma.organizationMember.findMany({ where: { organizationId }, select: { userId: true } })).map((member) => member.userId)
    const [organization, affiliates, activated, completedProfiles, projects, recentImports] = await Promise.all([
      this.prisma.organization.findUniqueOrThrow({ where: { id: organizationId }, select: { id: true, name: true } }),
      this.prisma.affiliation.count({ where: { organizationId } }),
      this.prisma.affiliation.count({ where: { organizationId, user: { status: 'ACTIVE' } } }),
      this.prisma.affiliation.count({ where: { organizationId, user: { talentProfile: { completion: { gte: 60 } } } } }),
      this.prisma.project.count({ where: { createdById: { in: memberIds } } }),
      this.prisma.importBatch.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, fileKey: true, status: true, createdAt: true, totalRows: true, errorRows: true } }),
    ])
    return {
      id: organization.id,
      name: organization.name,
      role,
      canManage: role === OrganizationRole.ORG_ADMIN || role === OrganizationRole.ORG_MANAGER,
      metrics: { affiliates: this.hideSmall(affiliates), activated: this.hideSmall(activated), completedProfiles: this.hideSmall(completedProfiles), projects: this.hideSmall(projects) },
      recentImports: recentImports.map((batch) => ({ id: batch.id, fileName: batch.fileKey.split('/').pop() ?? batch.fileKey, status: batch.status, createdAt: batch.createdAt, totalRows: batch.totalRows, errorRows: batch.errorRows })),
    }
  }

  private hideSmall(value: number) { return value < MIN_AGGREGATION_THRESHOLD ? null : value }
}
