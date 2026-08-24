import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import {
  ProjectStatus,
  type ProjectFeedCard,
  type ProjectFeedQuery,
  type ProjectFeedResponse,
} from '@cofound/shared'

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(query: ProjectFeedQuery): Promise<ProjectFeedResponse> {
    const limit = query.limit ?? 20
    const status = query.status ?? ProjectStatus.RECRUITING

    const whereCondition: Record<string, unknown> = {
      status,
    }

    if (query.sectorId) {
      whereCondition.sectorId = query.sectorId
    }

    if (query.regionId) {
      whereCondition.regionId = query.regionId
    }

    if (query.search) {
      const searchTerm = query.search.trim()
      whereCondition.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { pitch: { contains: searchTerm, mode: 'insensitive' } },
      ]
    }

    const projects = await this.prisma.project.findMany({
      where: whereCondition,
      include: {
        sector: true,
        region: true,
        createdBy: {
          include: {
            talentProfile: true,
          },
        },
        positions: {
          where: { isOpen: true },
        },
        members: {
          where: { leftAt: null },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(query.cursor
        ? {
            skip: 1,
            cursor: { id: query.cursor },
          }
        : {}),
    })

    const hasMore = projects.length > limit
    const itemsRaw = hasMore ? projects.slice(0, limit) : projects
    const nextCursor = hasMore && itemsRaw.length > 0 ? (itemsRaw[itemsRaw.length - 1]?.id ?? null) : null


    const items: ProjectFeedCard[] = itemsRaw.map((p) => {
      const creatorProfile = p.createdBy?.talentProfile
      return {
        id: p.id,
        title: p.title,
        pitch: p.pitch,
        status: p.status as ProjectStatus,
        createdAt: p.createdAt,
        sector: p.sector
          ? { id: p.sector.id, slug: p.sector.slug, labelKey: p.sector.labelKey }
          : null,
        region: p.region
          ? { id: p.region.id, slug: p.region.slug, labelKey: p.region.labelKey }
          : null,
        openPositionsCount: p.positions?.length ?? 0,
        membersCount: p.members?.length ?? 0,
        owner: creatorProfile
          ? {
              pseudonym: creatorProfile.pseudonym,
              avatarSeed: creatorProfile.avatarSeed,
            }
          : null,
      }
    })

    return {
      items,
      nextCursor,
      hasMore,
    }
  }
}
