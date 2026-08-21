import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { AffiliationStatus, OrganizationRole } from '@prisma/client'
import type { PrismaService } from '../prisma/prisma.service.js'

const MANAGERS: OrganizationRole[] = [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_MANAGER]
@Injectable()
export class InstitutionAffiliationService {
  constructor(private readonly prisma: PrismaService) {}
  async list(organizationId: string, actorId: string, filters: { cohortYear?: number; fieldId?: string; status?: string }) {
    await this.assertManager(organizationId, actorId)
    const affiliations = await this.prisma.affiliation.findMany({ where: { organizationId, ...(filters.cohortYear ? { cohortYear: filters.cohortYear } : {}), ...(filters.fieldId ? { fieldId: filters.fieldId } : {}), ...(filters.status ? { status: filters.status as AffiliationStatus } : {}) }, include: { user: { select: { id: true, email: true, status: true, activatedAt: true } }, field: { select: { id: true, labelKey: true } } }, orderBy: { startedAt: 'desc' } })
    return { affiliations: affiliations.map((item) => ({ id: item.id, userId: item.user.id, email: item.user.email, accountStatus: item.user.status, activatedAt: item.user.activatedAt, status: item.status, cohortYear: item.cohortYear, field: item.field })) }
  }
  async update(id: string, actorId: string, status: string) { const affiliation = await this.findOwned(id, actorId); return this.prisma.affiliation.update({ where: { id: affiliation.id }, data: { status: status as AffiliationStatus, changedById: actorId } }) }
  async bulkStatus(actorId: string, ids: string[], status: string, confirmation: string) {
    if (confirmation !== `MODIFIER ${ids.length}`) throw new ConflictException(`Saisissez MODIFIER ${ids.length} pour confirmer.`)
    const owned = await this.prisma.affiliation.findMany({ where: { id: { in: ids } }, select: { id: true, organizationId: true } })
    const orgs = [...new Set(owned.map((item) => item.organizationId))]
    if (owned.length !== ids.length || orgs.length !== 1) throw new ForbiddenException('Une ou plusieurs affiliations ne sont pas accessibles.')
    await this.assertManager(orgs[0]!, actorId)
    return this.prisma.$transaction(async (transaction) => { const result = await transaction.affiliation.updateMany({ where: { id: { in: ids }, organizationId: orgs[0] }, data: { status: status as AffiliationStatus, changedById: actorId } }); return { updated: result.count, status } })
  }
  private async findOwned(id: string, actorId: string) { const item = await this.prisma.affiliation.findUnique({ where: { id } }); if (!item) throw new NotFoundException('Affiliation introuvable.'); await this.assertManager(item.organizationId, actorId); return item }
  private async assertManager(organizationId: string, actorId: string) { const member = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: actorId } } }); if (!member || !MANAGERS.includes(member.role)) throw new ForbiddenException('Accès gestionnaire requis.'); return member }
}
