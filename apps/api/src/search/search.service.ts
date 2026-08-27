import { Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  SearchQuery,
  SearchResponse,
  ProjectSearchResult,
  TalentSearchResult,
  OpportunitySearchResult,
} from '@cofound/shared'

@Injectable()
export class SearchService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async search(query: SearchQuery): Promise<SearchResponse> {
    const term = query.q.trim()
    if (!term) {
      return {
        query: term,
        projects: [],
        talents: [],
        opportunities: [],
        counts: { projects: 0, talents: 0, opportunities: 0 },
      }
    }

    const searchPattern = `%${term}%`

    const shouldSearchProjects = query.type === 'all' || query.type === 'projects'
    const shouldSearchTalents = query.type === 'all' || query.type === 'talents'
    const shouldSearchOpportunities = query.type === 'all' || query.type === 'opportunities'

    const projectsPromise = shouldSearchProjects
      ? this.searchProjects(searchPattern, query.limit)
      : Promise.resolve([])

    const talentsPromise = shouldSearchTalents
      ? this.searchTalents(searchPattern, query.limit)
      : Promise.resolve([])

    const opportunitiesPromise = shouldSearchOpportunities
      ? this.searchOpportunities(searchPattern, query.limit)
      : Promise.resolve([])

    const [projects, talents, opportunities] = await Promise.all([
      projectsPromise,
      talentsPromise,
      opportunitiesPromise,
    ])

    return {
      query: term,
      projects,
      talents,
      opportunities,
      counts: {
        projects: projects.length,
        talents: talents.length,
        opportunities: opportunities.length,
      },
    }
  }

  private async searchProjects(
    pattern: string,
    limit: number,
  ): Promise<ProjectSearchResult[]> {
    try {
      // Direct raw query using PostgreSQL unaccent + ILIKE for accent/case insensitivity
      const rawProjects = await this.prisma.$queryRaw<
        Array<{
          id: string
          title: string
          pitch: string
          status: string
          createdAt: Date
        }>
      >`
        SELECT id, title, pitch, status, "createdAt"
        FROM "Project"
        WHERE status != 'DRAFT'::"ProjectStatus"
          AND (
            unaccent(title) ILIKE unaccent(${pattern})
            OR unaccent(pitch) ILIKE unaccent(${pattern})
          )
        ORDER BY "createdAt" DESC
        LIMIT ${limit}
      `
      return rawProjects.map((p) => ({
        id: p.id,
        title: p.title,
        pitch: p.pitch,
        status: p.status as ProjectSearchResult['status'],
        createdAt: p.createdAt,
      }))
    } catch {
      // Fallback using standard Prisma query if unaccent extension isn't available in local test DB
      const projects = await this.prisma.project.findMany({
        where: {
          status: { not: 'DRAFT' },
          OR: [
            { title: { contains: pattern.replace(/%/g, ''), mode: 'insensitive' } },
            { pitch: { contains: pattern.replace(/%/g, ''), mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, pitch: true, status: true, createdAt: true },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      return projects
    }
  }

  private async searchTalents(
    pattern: string,
    limit: number,
  ): Promise<TalentSearchResult[]> {
    try {
      const rawTalents = await this.prisma.$queryRaw<
        Array<{
          pseudonym: string
          avatarSeed: string
          headline: string | null
          bio: string | null
          fieldId: string | null
          cohortYear: number | null
          availabilityHours: number | null
          completion: number
        }>
      >`
        SELECT 
          tp.pseudonym,
          tp."avatarSeed",
          tp.headline,
          tp.bio,
          tp."fieldId",
          tp."cohortYear",
          tp."availabilityHours",
          tp.completion
        FROM "TalentProfile" tp
        JOIN "User" u ON u.id = tp."userId"
        WHERE tp."visibleInTalentFeed" = true
          AND u."accountStatus" = 'ACTIVE'::"AccountStatus"
          AND (
            unaccent(tp.pseudonym) ILIKE unaccent(${pattern})
            OR unaccent(COALESCE(tp.headline, '')) ILIKE unaccent(${pattern})
            OR unaccent(COALESCE(tp.bio, '')) ILIKE unaccent(${pattern})
          )
        LIMIT ${limit}
      `
      return rawTalents.map((t) => ({
        revealed: false as const,
        pseudonym: t.pseudonym,
        avatarSeed: t.avatarSeed,
        headline: t.headline,
        bio: t.bio,
        fieldId: t.fieldId,
        cohortYear: t.cohortYear,
        availabilityHours: t.availabilityHours,
        completion: t.completion,
      }))
    } catch {
      const cleanPattern = pattern.replace(/%/g, '')
      const profiles = await this.prisma.talentProfile.findMany({
        where: {
          visibleInTalentFeed: true,
          user: { status: 'ACTIVE' },
          OR: [
            { pseudonym: { contains: cleanPattern, mode: 'insensitive' } },
            { headline: { contains: cleanPattern, mode: 'insensitive' } },
            { bio: { contains: cleanPattern, mode: 'insensitive' } },
          ],
        },
        select: {
          pseudonym: true,
          avatarSeed: true,
          headline: true,
          bio: true,
          fieldId: true,
          cohortYear: true,
          availabilityHours: true,
          completion: true,
        },
        take: limit,
      })
      return profiles.map((t) => ({
        revealed: false as const,
        pseudonym: t.pseudonym,
        avatarSeed: t.avatarSeed,
        headline: t.headline,
        bio: t.bio,
        fieldId: t.fieldId,
        cohortYear: t.cohortYear,
        availabilityHours: t.availabilityHours,
        completion: t.completion,
      }))
    }
  }

  private async searchOpportunities(
    pattern: string,
    limit: number,
  ): Promise<OpportunitySearchResult[]> {
    try {
      const rawOpps = await this.prisma.$queryRaw<
        Array<{
          id: string
          title: string
          description: string
          opportunityType: string
          organizationName: string | null
          createdAt: Date
        }>
      >`
        SELECT 
          o.id,
          o.title,
          o.description,
          o.type as "opportunityType",
          org.name as "organizationName",
          o."createdAt"
        FROM "Opportunity" o
        LEFT JOIN "Organization" org ON org.id = o."organizationId"
        WHERE unaccent(o.title) ILIKE unaccent(${pattern})
           OR unaccent(o.description) ILIKE unaccent(${pattern})
        ORDER BY o."createdAt" DESC
        LIMIT ${limit}
      `
      return rawOpps.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        opportunityType: o.opportunityType,
        organizationName: o.organizationName ?? undefined,
        createdAt: o.createdAt,
      }))
    } catch {
      const cleanPattern = pattern.replace(/%/g, '')
      const opps = await this.prisma.opportunity.findMany({
        where: {
          OR: [
            { title: { contains: cleanPattern, mode: 'insensitive' } },
            { description: { contains: cleanPattern, mode: 'insensitive' } },
          ],
        },
        include: { organization: { select: { name: true } } },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      return opps.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        opportunityType: o.type,
        organizationName: o.organization?.name,
        createdAt: o.createdAt,
      }))
    }
  }
}
