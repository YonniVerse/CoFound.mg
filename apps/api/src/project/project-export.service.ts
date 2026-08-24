import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'

const projectArchiveSelect = {
  id: true,
  title: true,
  pitch: true,
  status: true,
  sectorId: true,
  regionId: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  canvas: { select: { blocks: true, completion: true, updatedAt: true } },
  members: { where: { leftAt: null }, select: { role: true, functionalRole: true, joinedAt: true, user: { select: { talentProfile: { select: { pseudonym: true } } } } } },
  positions: { select: { id: true, title: true, description: true, expectedHours: true, isOpen: true, skills: { select: { skillId: true } } } },
  tasks: { select: { id: true, title: true, description: true, dueDate: true, status: true, createdAt: true, updatedAt: true, assignee: { select: { talentProfile: { select: { pseudonym: true } } } } } },
  posts: { orderBy: { createdAt: 'asc' as const }, select: { id: true, type: true, content: true, sectorId: true, expiresAt: true, createdAt: true, author: { select: { pseudonym: true } } } },
} satisfies Prisma.ProjectSelect

@Injectable()
export class ProjectExportService {
  constructor(private readonly prisma: PrismaService) {}

  async export(projectId: string, requesterId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.findUnique({ where: { id: projectId }, select: projectArchiveSelect })
      if (!project) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.projectNotFound' })
      const membership = await transaction.projectMember.findFirst({ where: { projectId, userId: requesterId, leftAt: null }, select: { role: true } })
      if (!membership) throw new ForbiddenException({ code: 'PROJECT_ACCESS_DENIED', messageKey: 'errors.projectAccessDenied' })
      if (membership.role !== 'OWNER') throw new ForbiddenException({ code: 'PROJECT_OWNER_REQUIRED', messageKey: 'errors.projectOwnerRequired' })
      return {
        archiveVersion: 1,
        generatedAt: new Date(),
        project: {
          id: project.id,
          title: project.title,
          pitch: project.pitch,
          status: project.status,
          sectorId: project.sectorId,
          regionId: project.regionId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          publishedAt: project.publishedAt,
        },
        canvas: project.canvas,
        members: project.members.map((member) => ({ role: member.role, functionalRole: member.functionalRole, joinedAt: member.joinedAt, pseudonym: member.user.talentProfile?.pseudonym ?? null })),
        positions: project.positions,
        tasks: project.tasks.map((task) => ({ ...task, assigneePseudonym: task.assignee?.talentProfile?.pseudonym ?? null, assignee: undefined })),
        posts: project.posts,
        metadata: { containsCivilIdentities: false, pseudonymized: true },
      }
    })
  }
}
