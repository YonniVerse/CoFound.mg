import { Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import {
  ProjectStatus,
  type ProjectFeedCard,
  type ProjectFeedQuery,
  type ProjectFeedResponse,
  type ProjectPostFeedItem,
  type ProjectPostFeedResponse,
  type ProjectPostType,
} from '@cofound/shared'

@Injectable()
export class ProjectsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

  async getPostsFeed(query: { search?: string; cursor?: string; limit?: number }): Promise<ProjectPostFeedResponse> {
    const limit = query.limit ?? 20
    const searchTerm = query.search?.trim()
    const posts = await this.prisma.post.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        project: {
          status: { in: [ProjectStatus.RECRUITING, ProjectStatus.ACTIVE] },
          ...(searchTerm
            ? {
                OR: [
                  { title: { contains: searchTerm, mode: 'insensitive' } },
                  { pitch: { contains: searchTerm, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
      },
      select: {
        id: true,
        projectId: true,
        type: true,
        content: true,
        expiresAt: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true,
            pitch: true,
            status: true,
            sector: { select: { id: true, slug: true, labelKey: true } },
            region: { select: { id: true, slug: true, labelKey: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
    })

    const hasMore = posts.length > limit
    const itemsRaw = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore && itemsRaw.length > 0 ? (itemsRaw[itemsRaw.length - 1]?.id ?? null) : null
    const items: ProjectPostFeedItem[] = itemsRaw.map((post) => ({
      id: post.id,
      projectId: post.projectId,
      type: post.type as ProjectPostType,
      content: post.content,
      expiresAt: post.expiresAt,
      createdAt: post.createdAt,
      project: {
        id: post.project.id,
        title: post.project.title,
        pitch: post.project.pitch,
        status: post.project.status as ProjectStatus,
        sector: post.project.sector,
        region: post.project.region,
      },
    }))

    return { items, nextCursor, hasMore }
  }
}
