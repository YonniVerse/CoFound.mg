import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { OrganizationRole } from '@prisma/client'
import type { InstitutionMemberInvite, InstitutionMemberUpdate } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

const MANAGERS: OrganizationRole[] = [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_MANAGER]
const READERS: OrganizationRole[] = [...MANAGERS, OrganizationRole.ORG_VIEWER]

@Injectable()
export class InstitutionMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string, actorId: string) {
    await this.assertManager(organizationId, actorId, false)
    const members = await this.prisma.organizationMember.findMany({ where: { organizationId }, include: { user: { select: { id: true, email: true, status: true } } }, orderBy: { createdAt: 'asc' } })
    return { members: members.map((member) => ({ id: member.id, userId: member.user.id, email: member.user.email, status: member.user.status, role: member.role, createdAt: member.createdAt })) }
  }

  async invite(organizationId: string, actorId: string, input: InstitutionMemberInvite) {
    await this.assertManager(organizationId, actorId, true)
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.upsert({ where: { email: input.email.toLowerCase() }, update: {}, create: { email: input.email.toLowerCase(), status: 'INVITED', platformRole: 'ORG_MEMBER', locale: 'fr' } })
      const existing = await transaction.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: user.id } } })
      if (existing) throw new ConflictException('Cet utilisateur est déjà membre de l’organisation.')
      const member = await transaction.organizationMember.create({ data: { organizationId, userId: user.id, role: input.role as OrganizationRole }, include: { user: { select: { id: true, email: true, status: true } } } })
      return { id: member.id, userId: member.user.id, email: member.user.email, status: member.user.status, role: member.role, createdAt: member.createdAt }
    })
  }

  async update(organizationId: string, memberId: string, actorId: string, input: InstitutionMemberUpdate) {
    await this.assertManager(organizationId, actorId, true)
    const member = await this.findMember(organizationId, memberId)
    if (member.role === OrganizationRole.ORG_ADMIN && input.role !== OrganizationRole.ORG_ADMIN) await this.assertNotLastAdmin(organizationId)
    return this.prisma.organizationMember.update({ where: { id: memberId }, data: { role: input.role as OrganizationRole }, include: { user: { select: { id: true, email: true, status: true } } } }).then((updated) => ({ id: updated.id, userId: updated.user.id, email: updated.user.email, status: updated.user.status, role: updated.role, createdAt: updated.createdAt }))
  }

  async remove(organizationId: string, memberId: string, actorId: string) {
    await this.assertManager(organizationId, actorId, true)
    const member = await this.findMember(organizationId, memberId)
    if (member.role === OrganizationRole.ORG_ADMIN) await this.assertNotLastAdmin(organizationId)
    await this.prisma.organizationMember.delete({ where: { id: memberId } })
    return { removed: true, id: memberId }
  }

  private async assertManager(organizationId: string, actorId: string, managerOnly: boolean) {
    const member = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: actorId } } })
    if (!member || (managerOnly ? !MANAGERS.includes(member.role) : !READERS.includes(member.role))) throw new ForbiddenException('Accès organisationnel insuffisant.')
    return member
  }

  private async findMember(organizationId: string, memberId: string) {
    const member = await this.prisma.organizationMember.findFirst({ where: { id: memberId, organizationId } })
    if (!member) throw new NotFoundException('Membre introuvable dans cette organisation.')
    return member
  }

  private async assertNotLastAdmin(organizationId: string) {
    const admins = await this.prisma.organizationMember.count({ where: { organizationId, role: OrganizationRole.ORG_ADMIN } })
    if (admins <= 1) throw new ConflictException('Le dernier administrateur ne peut pas être retiré ou rétrogradé.')
  }
}
