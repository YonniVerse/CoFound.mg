import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { dreamMatchSuggestionsQuerySchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

type ScoredSuggestionRow = {
  talentId: string
  pseudonym: string
  avatarSeed: string
  headline: string | null
  bio: string | null
  skillComplementarity: number
  sectorOverlap: number
  availability: number
}

@Injectable()
export class DreamMatchScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async markNotInterested(userId: string, candidateTalentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const seeker = await tx.dreamMatchProfile.findFirst({ where: { talent: { userId } }, select: { talentId: true } })
      if (!seeker || seeker.talentId === candidateTalentId) throw new NotFoundException('Suggestion Dream-Match introuvable')
      const candidate = await tx.talentProfile.findUnique({ where: { id: candidateTalentId }, select: { id: true } })
      if (!candidate) throw new NotFoundException('Suggestion Dream-Match introuvable')
      await tx.dreamMatchExclusion.upsert({
        where: { seekerId_candidateId: { seekerId: seeker.talentId, candidateId: candidateTalentId } },
        create: { seekerId: seeker.talentId, candidateId: candidateTalentId },
        update: {},
      })
      return { excluded: true as const, talentId: candidateTalentId }
    })
  }

  async getSuggestions(userId: string, input: unknown) {
    const parsed = dreamMatchSuggestionsQuerySchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const { limit, cursor } = parsed.data

    const seeker = await this.prisma.dreamMatchProfile.findFirst({
      where: { talent: { userId } },
      select: { id: true },
    })
    if (!seeker) throw new NotFoundException('Profil Dream-Match introuvable')

    const cursorId = cursor ?? ''
    const rows = await this.prisma.$queryRaw<ScoredSuggestionRow[]>(Prisma.sql`
      WITH seeker AS (
        SELECT d."minAvailability", COALESCE(d."sectors", '[]'::jsonb) AS sectors
        FROM "DreamMatchProfile" d
        JOIN "TalentProfile" t ON t.id = d."talentId"
        WHERE t."userId" = ${userId}
      ), ranked AS (
        SELECT
          candidate.id AS "talentId",
          candidate.pseudonym,
          candidate."avatarSeed",
          candidate.headline,
          candidate.bio,
          LEAST(50, COALESCE((
            SELECT SUM(ds.importance)::numeric * 50 / NULLIF((SELECT SUM(ds2.importance) FROM "DreamMatchSkill" ds2 WHERE ds2."dreamId" = seekerDream.id), 0)
            FROM "DreamMatchSkill" ds
            JOIN "DreamMatchProfile" seekerDream ON seekerDream.id = (SELECT d2.id FROM "DreamMatchProfile" d2 JOIN "TalentProfile" st ON st.id = d2."talentId" WHERE st."userId" = ${userId})
            WHERE ds."dreamId" = seekerDream.id
              AND EXISTS (SELECT 1 FROM "TalentSkill" ts WHERE ts."talentId" = candidate.id AND ts."skillId" = ds."skillId")
          ), 0))::float8 AS "skillComplementarity",
          CASE WHEN EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(candidate.sectors, '[]'::jsonb)) cs
            WHERE cs.value IN (SELECT jsonb_array_elements_text(sectors) FROM seeker)
          ) THEN 25 ELSE 0 END::float8 AS "sectorOverlap",
          CASE
            WHEN (SELECT "minAvailability" FROM seeker) IS NULL OR candidate."availabilityHours" IS NULL THEN 0
            WHEN candidate."availabilityHours" >= (SELECT "minAvailability" FROM seeker) THEN 25
            ELSE LEAST(25, candidate."availabilityHours"::numeric * 25 / NULLIF((SELECT "minAvailability" FROM seeker), 0))
          END::float8 AS availability
        FROM "TalentProfile" candidate
        WHERE candidate."visibleInTalentFeed" = true
          AND candidate."userId" <> ${userId}
          AND NOT EXISTS (
            SELECT 1 FROM "DreamMatchExclusion" exclusion
            JOIN "TalentProfile" seekerProfile ON seekerProfile.id = exclusion."seekerId"
            WHERE seekerProfile."userId" = ${userId}
              AND exclusion."candidateId" = candidate.id
          )
          AND (${cursorId} = '' OR candidate.id > ${cursorId})
      )
      SELECT *, ("skillComplementarity" + "sectorOverlap" + availability)::float8 AS score
      FROM ranked
      ORDER BY score DESC, "talentId" ASC
      LIMIT ${limit + 1}
    `)

    const hasMore = rows.length > limit
    const items = rows.slice(0, limit).map((row) => ({
      talentId: row.talentId,
      pseudonym: row.pseudonym,
      avatarSeed: row.avatarSeed,
      headline: row.headline,
      bio: row.bio,
      score: Math.round((Number(row.skillComplementarity) + Number(row.sectorOverlap) + Number(row.availability)) * 100) / 100,
      factors: {
        skillComplementarity: Number(row.skillComplementarity),
        sectorOverlap: Number(row.sectorOverlap),
        availability: Number(row.availability),
      },
    }))
    return { items, nextCursor: hasMore ? items.at(-1)?.talentId ?? null : null, hasMore }
  }
}
