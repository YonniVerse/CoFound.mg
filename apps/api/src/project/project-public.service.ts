import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class ProjectPublicService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getPublic(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, select: {
      id: true, title: true, pitch: true, status: true, sectorId: true, regionId: true,
      canvas: { select: { blocks: true } },
      members: { where: { leftAt: null }, select: { role: true, user: { select: { talentProfile: { select: { pseudonym: true, avatarSeed: true } } } } } },
      positions: { where: { isOpen: true }, select: { id: true, title: true, description: true, expectedHours: true } },
      posts: { where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, orderBy: { createdAt: 'desc' }, select: { id: true, type: true, content: true, createdAt: true } },
    } satisfies Prisma.ProjectSelect })
    if (!project) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.projectNotFound' })
    const blocks = project.canvas?.blocks && typeof project.canvas.blocks === 'object' && !Array.isArray(project.canvas.blocks) ? project.canvas.blocks as Record<string, unknown> : {}
    const publicBmc = Object.fromEntries(Object.entries(blocks).filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value) && (value as { isPublic?: unknown }).isPublic === true).map(([key, value]) => [key, { content: typeof (value as { content?: unknown }).content === 'string' ? (value as { content: string }).content : '', isPublic: true as const }]))
    return { id: project.id, title: project.title, pitch: project.pitch, status: project.status, sectorId: project.sectorId, regionId: project.regionId, publicBmc, members: project.members.flatMap((member) => member.user.talentProfile ? [{ pseudonym: member.user.talentProfile.pseudonym, avatarSeed: member.user.talentProfile.avatarSeed, role: member.role }] : []), positions: project.positions, posts: project.posts }
  }
}
