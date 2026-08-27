import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { ProjectStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import { BMC_BLOCK_KEYS, type BmcBlockKey, type OwnedProjectsResponse, type ProjectCreateInput } from '@cofound/shared'

type PublishResult = { published: boolean; missingBlocks: BmcBlockKey[]; status: ProjectStatus; id?: string; publishedAt?: Date | null }

@Injectable()
export class ProjectService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getMine(actorId: string): Promise<OwnedProjectsResponse> {
    const projects = await this.prisma.project.findMany({
      where: { createdById: actorId },
      select: { id: true, title: true, pitch: true, status: true, createdAt: true },
      orderBy: { updatedAt: 'desc' },
    })
    return { projects }
  }

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

  async publish(actorId: string, projectId: string): Promise<PublishResult> {
    return this.prisma.$transaction(async (transaction) => {
      const project = await transaction.project.findUnique({
        where: { id: projectId },
        select: { id: true, status: true, members: { where: { userId: actorId, leftAt: null }, select: { role: true } }, canvas: { select: { blocks: true } } },
      })
      if (!project) throw new NotFoundException('Projet introuvable.')
      if (!project.members.some((member) => member.role === 'OWNER')) throw new ForbiddenException('Seul le propriétaire peut publier le projet.')
      if (project.status !== ProjectStatus.DRAFT) throw new ForbiddenException('Seul un projet en brouillon peut être publié.')
      const blocks = project.canvas?.blocks && typeof project.canvas.blocks === 'object' && !Array.isArray(project.canvas.blocks) ? project.canvas.blocks as Record<string, unknown> : {}
      const missingBlocks: BmcBlockKey[] = BMC_BLOCK_KEYS.filter((key) => {
        const block = blocks[key]
        return !block || typeof block !== 'object' || Array.isArray(block) || typeof (block as { content?: unknown }).content !== 'string' || !(block as { content: string }).content.trim()
      })
      if (missingBlocks.length > 0) return { published: false, missingBlocks, status: project.status }
      const updated = await transaction.project.update({ where: { id: projectId }, data: { status: ProjectStatus.RECRUITING, publishedAt: new Date() }, select: { id: true, status: true, publishedAt: true } })
      return { published: true, missingBlocks: [], ...updated }
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
