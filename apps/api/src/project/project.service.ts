import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ProjectStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import type { ProjectCreateInput } from '@cofound/shared'

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actorId: string, input: ProjectCreateInput) {
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.create({
        data: {
          title: input.title,
          pitch: input.pitch,
          sectorId: input.sectorId ?? null,
          regionId: input.regionId ?? null,
          createdById: actorId,
          status: ProjectStatus.DRAFT,
          members: { create: { userId: actorId, role: 'OWNER' } },
        },
        select: this.projectSelect,
      })
      return project
    })
  }

  async getById(actorId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, select: this.projectSelect })
    if (!project) throw new NotFoundException('Projet introuvable.')
    const isMember = project.members.some((member) => member.userId === actorId)
    if (!isMember) throw new ForbiddenException('Accès au projet refusé.')
    return project
  }

  private readonly projectSelect = {
    id: true,
    title: true,
    pitch: true,
    status: true,
    sectorId: true,
    regionId: true,
    createdById: true,
    createdAt: true,
    updatedAt: true,
    members: { where: { leftAt: null }, select: { userId: true, role: true } },
  } as const
}
