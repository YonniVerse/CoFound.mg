import { ForbiddenException, Injectable } from '@nestjs/common'
import { OrganizationRole } from '@prisma/client'
import type { PrismaService } from '../prisma/prisma.service.js'

const VIEWERS = [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_MANAGER, OrganizationRole.ORG_VIEWER]
@Injectable()
export class InstitutionDirectoryService {
  constructor(private readonly prisma: PrismaService) {}
  async list(organizationId: string, actorId: string, query: { search?: string; cohortYear?: number; status?: string }) {
    await this.assertViewer(organizationId, actorId)
    const affiliations = await this.prisma.affiliation.findMany({ where: { organizationId, ...(query.cohortYear ? { cohortYear: query.cohortYear } : {}), ...(query.status ? { status: query.status as never } : {}), ...(query.search ? { user: { OR: [{ email: { contains: query.search, mode: 'insensitive' } }, { talentIdentity: { firstName: { contains: query.search, mode: 'insensitive' } } }, { talentIdentity: { lastName: { contains: query.search, mode: 'insensitive' } } }] } } : {}) }, include: { user: { select: { id: true, email: true, status: true, lastLoginAt: true, talentIdentity: { select: { firstName: true, lastName: true, photoKey: true } }, talentProfile: { select: { completion: true, field: { select: { labelKey: true } } } }, projectMembers: { where: { leftAt: null }, select: { project: { select: { id: true, title: true, status: true } } } } } } }, orderBy: { startedAt: 'desc' } })
    return { directory: affiliations.map(({ user, cohortYear, status }) => ({ id: user.id, name: user.talentIdentity ? `${user.talentIdentity.firstName} ${user.talentIdentity.lastName}` : user.email, email: user.email, photoKey: user.talentIdentity?.photoKey ?? null, field: user.talentProfile?.field ?? null, cohortYear, completion: user.talentProfile?.completion ?? 0, projects: user.projectMembers.map(({ project }) => ({ id: project.id, title: project.title, status: project.status })), accountStatus: user.status, lastLoginAt: user.lastLoginAt, affiliationStatus: status })) }
  }
  private async assertViewer(organizationId: string, actorId: string) { const member = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: actorId } } }); if (!member || !VIEWERS.includes(member.role)) throw new ForbiddenException('Accès annuaire refusé.') }
}
