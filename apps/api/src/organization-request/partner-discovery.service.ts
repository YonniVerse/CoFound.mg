import { ForbiddenException, Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common'
import { partnerProjectSearchSchema, partnerTalentSearchSchema, projectWatchInputSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class PartnerDiscoveryService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async search(actorId: string, organizationId: string, input: unknown) {
    await this.assertRecruiter(actorId, organizationId)
    const parsed = partnerProjectSearchSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const { q, sectorId, regionId, minMaturity, maxMaturity, limit } = parsed.data
    const cleanQuery = q?.trim()
    const projects = await this.prisma.project.findMany({
      where: {
        status: { in: ['RECRUITING', 'ACTIVE'] },
        ...(sectorId ? { sectorId } : {}),
        ...(regionId ? { regionId } : {}),
        canvas: { is: { completion: { gte: minMaturity, lte: maxMaturity } } },
        ...(cleanQuery ? { OR: [{ title: { contains: cleanQuery, mode: 'insensitive' } }, { pitch: { contains: cleanQuery, mode: 'insensitive' } }] } : {}),
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      take: limit,
      select: { id: true, title: true, pitch: true, status: true, sectorId: true, regionId: true, createdAt: true, canvas: { select: { completion: true } } },
    })
    return {
      items: projects.map((project) => ({
        id: project.id,
        title: project.title,
        pitch: project.pitch,
        status: project.status,
        maturity: project.canvas?.completion ?? 0,
        sectorId: project.sectorId,
        regionId: project.regionId,
        createdAt: project.createdAt,
      })),
    }
  }

  async searchTalents(actorId: string, organizationId: string, input: unknown) {
    await this.assertRecruiter(actorId, organizationId)
    const parsed = partnerTalentSearchSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const q = parsed.data.q?.trim()
    const profiles = await this.prisma.talentProfile.findMany({
      where: {
        visibleInTalentFeed: true,
        user: { status: 'ACTIVE' },
        ...(parsed.data.fieldId ? { fieldId: parsed.data.fieldId } : {}),
        ...(q ? { OR: [{ pseudonym: { contains: q, mode: 'insensitive' } }, { headline: { contains: q, mode: 'insensitive' } }, { bio: { contains: q, mode: 'insensitive' } }] } : {}),
      },
      orderBy: [{ completion: 'desc' }, { updatedAt: 'desc' }],
      take: parsed.data.limit,
      select: { pseudonym: true, avatarSeed: true, headline: true, bio: true, fieldId: true, completion: true },
    })
    return { items: profiles.map((profile) => ({ ...profile, revealed: false as const })) }
  }

  async listWatches(actorId: string, organizationId: string) {
    await this.assertRecruiter(actorId, organizationId)
    const watches = await this.prisma.projectWatch.findMany({ where: { organizationId }, orderBy: { updatedAt: 'desc' }, select: { id: true, projectId: true, note: true, createdAt: true, updatedAt: true } })
    return { items: watches.map((watch) => ({ ...watch, organizationId })) }
  }

  async saveWatch(actorId: string, organizationId: string, projectId: string, input: unknown) {
    await this.assertRecruiter(actorId, organizationId)
    const parsed = projectWatchInputSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const project = await this.prisma.project.findFirst({ where: { id: projectId, status: { in: ['RECRUITING', 'ACTIVE'] } }, select: { id: true } })
    if (!project) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.notFound' })
    return this.prisma.projectWatch.upsert({ where: { organizationId_projectId: { organizationId, projectId } }, update: { note: parsed.data.note || null }, create: { organizationId, projectId, note: parsed.data.note || null }, select: { id: true, projectId: true, note: true, createdAt: true, updatedAt: true } }).then((watch) => ({ ...watch, organizationId }))
  }

  async removeWatch(actorId: string, organizationId: string, projectId: string) {
    await this.assertRecruiter(actorId, organizationId)
    const watch = await this.prisma.projectWatch.findUnique({ where: { organizationId_projectId: { organizationId, projectId } }, select: { id: true } })
    if (!watch) throw new NotFoundException({ code: 'PROJECT_WATCH_NOT_FOUND', messageKey: 'errors.notFound' })
    await this.prisma.projectWatch.delete({ where: { id: watch.id } })
    return { removed: true, projectId }
  }

  private async assertRecruiter(actorId: string, organizationId: string) {
    const membership = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId: actorId } },
      select: { user: { select: { status: true } }, organization: { select: { capabilities: { select: { capability: true } } } } },
    })
    if (!membership || membership.user.status !== 'ACTIVE' || !membership.organization.capabilities.some(({ capability }) => capability === 'RECRUIT')) throw new ForbiddenException({ code: 'ORGANIZATION_RECRUIT_REQUIRED', messageKey: 'errors.insufficientOrganizationCapability' })
    return membership
  }
}
