import { Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { TalentFeedCard, TalentFeedQuery, TalentFeedResponse } from '@cofound/shared'

@Injectable()
export class TalentsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getFeed(query: TalentFeedQuery): Promise<TalentFeedResponse> {
    const limit = query.limit ?? 20

    const whereCondition: Record<string, unknown> = {
      visibleInTalentFeed: true,
    }

    if (query.fieldId) {
      whereCondition.fieldId = query.fieldId
    }

    if (query.search) {
      const searchTerm = query.search.trim()
      whereCondition.OR = [
        { pseudonym: { contains: searchTerm, mode: 'insensitive' } },
        { headline: { contains: searchTerm, mode: 'insensitive' } },
        { bio: { contains: searchTerm, mode: 'insensitive' } },
      ]
    }

    const profiles = await this.prisma.talentProfile.findMany({
      where: whereCondition,
      include: {
        field: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: [
        { completion: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: limit + 1,
      ...(query.cursor
        ? {
            skip: 1,
            cursor: { id: query.cursor },
          }
        : {}),
    })

    const hasMore = profiles.length > limit
    const itemsRaw = hasMore ? profiles.slice(0, limit) : profiles
    const nextCursor = hasMore && itemsRaw.length > 0 ? (itemsRaw[itemsRaw.length - 1]?.id ?? null) : null

    const items: TalentFeedCard[] = itemsRaw.map((p) => ({
      id: p.id,
      pseudonym: p.pseudonym,
      avatarSeed: p.avatarSeed,
      headline: p.headline,
      bio: p.bio,
      field: p.field
        ? { id: p.field.id, slug: p.field.slug, labelKey: p.field.labelKey }
        : null,
      cohortYear: p.cohortYear,
      availabilityHours: p.availabilityHours,
      goals: Array.isArray(p.goals) ? (p.goals as string[]) : [],
      skills: p.skills.map((ts) => ({
        id: ts.skill.id,
        slug: ts.skill.slug,
        labelKey: ts.skill.labelKey,
        category: ts.skill.category ?? null,
      })),
      completion: p.completion,
    }))

    return {
      items,
      nextCursor,
      hasMore,
    }
  }
}
