import { BadRequestException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { ProjectRole } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  ProjectMemberItem,
  ProjectMembersResponse,
  ProjectRoleInput,
} from '@cofound/shared'

@Injectable()
export class ProjectMembersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async findActiveMembership(projectId: string, userId: string) {
    return this.prisma.projectMember.findFirst({ where: { projectId, userId, leftAt: null } })
  }

  private async requireProjectAccess(projectId: string, userId: string) {
    const membership = await this.findActiveMembership(projectId, userId)
    if (!membership) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.projectNotFound' })
    return membership
  }

  private toItem(member: {
    id: string; projectId: string; userId: string; role: ProjectRole; functionalRole: string | null; joinedAt: Date
    user: { talentProfile: { pseudonym: string; avatarSeed: string } | null; talentIdentity: { firstName: string; lastName: string } | null }
  }, revealIdentity: boolean): ProjectMemberItem {
    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      role: member.role,
      functionalRole: member.functionalRole,
      joinedAt: member.joinedAt,
      displayName: revealIdentity && member.user.talentIdentity
        ? `${member.user.talentIdentity.firstName} ${member.user.talentIdentity.lastName}`
        : null,
      pseudonym: member.user.talentProfile?.pseudonym ?? null,
      avatarSeed: member.user.talentProfile?.avatarSeed ?? null,
    }
  }

  async list(projectId: string, requesterId: string): Promise<ProjectMembersResponse> {
    await this.requireProjectAccess(projectId, requesterId)
    const members = await this.prisma.projectMember.findMany({
      where: { projectId, leftAt: null },
      include: { user: { select: { talentProfile: true, talentIdentity: { select: { firstName: true, lastName: true } } } } },
      orderBy: { joinedAt: 'asc' },
    })
    return { items: members.map((member) => this.toItem(member, true)) }
  }

  async add(projectId: string, ownerId: string, userId: string, role: ProjectRoleInput = 'MEMBER') {
    const owner = await this.requireProjectAccess(projectId, ownerId)
    if (owner.role !== ProjectRole.OWNER) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.projectNotFound' })
    const targetUser = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!targetUser) throw new NotFoundException({ code: 'USER_NOT_FOUND', messageKey: 'errors.userNotFound' })
    const existing = await this.prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } })
    if (existing?.leftAt === null) throw new BadRequestException({ code: 'MEMBER_ALREADY_ACTIVE', messageKey: 'errors.memberAlreadyActive' })
    return this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      create: { projectId, userId, role: role as ProjectRole },
      update: { role: role as ProjectRole, leftAt: null, joinedAt: new Date() },
      include: { user: { select: { talentProfile: true, talentIdentity: { select: { firstName: true, lastName: true } } } } },
    })
  }

  async updateRole(projectId: string, ownerId: string, memberId: string, role: ProjectRoleInput) {
    const owner = await this.requireProjectAccess(projectId, ownerId)
    if (owner.role !== ProjectRole.OWNER) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.projectNotFound' })
    return this.prisma.$transaction(async (transaction) => {
      const member = await transaction.projectMember.findFirst({ where: { id: memberId, projectId, leftAt: null } })
      if (!member) throw new NotFoundException({ code: 'MEMBER_NOT_FOUND', messageKey: 'errors.memberNotFound' })
      if (member.role === ProjectRole.OWNER && role !== 'OWNER') {
        const ownerCount = await transaction.projectMember.count({ where: { projectId, role: ProjectRole.OWNER, leftAt: null } })
        if (ownerCount <= 1) throw new BadRequestException({ code: 'LAST_OWNER', messageKey: 'errors.lastOwner' })
      }
      return transaction.projectMember.update({ where: { id: memberId }, data: { role: role as ProjectRole } })
    })
  }

  async leave(projectId: string, userId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const member = await transaction.projectMember.findFirst({ where: { projectId, userId, leftAt: null } })
      if (!member) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.projectNotFound' })
      if (member.role === ProjectRole.OWNER) {
        const ownerCount = await transaction.projectMember.count({ where: { projectId, role: ProjectRole.OWNER, leftAt: null } })
        if (ownerCount <= 1) throw new BadRequestException({ code: 'LAST_OWNER', messageKey: 'errors.lastOwner' })
      }
      return transaction.projectMember.update({ where: { id: member.id }, data: { leftAt: new Date() } })
    })
  }
}
