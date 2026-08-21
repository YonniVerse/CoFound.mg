import { Injectable, NotFoundException } from '@nestjs/common'
import { MIN_PROFILE_COMPLETION, talentProfileInputSchema, type TalentProfileInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        locale: true,
        talentIdentity: { select: { firstName: true, lastName: true, photoKey: true, phone: true, regionId: true } },
        talentProfile: { include: { field: true } },
      },
    })
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', messageKey: 'profile.errors.notFound' })
    const profile = user.talentProfile
    return {
      user: { id: user.id, email: user.email, locale: user.locale },
      identity: user.talentIdentity,
      profile: profile ? this.serializeProfile(profile) : null,
      minimumCompletion: MIN_PROFILE_COMPLETION,
    }
  }

  async updateMine(userId: string, rawInput: unknown) {
    const input = talentProfileInputSchema.parse(rawInput) as TalentProfileInput
    const profile = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.talentProfile.findUnique({ where: { userId } })
      const data = {
        pseudonym: input.pseudonym,
        headline: input.headline || null,
        bio: input.bio || null,
        fieldId: input.fieldId ?? null,
        cohortYear: input.cohortYear ?? null,
        availabilityHours: input.availabilityHours ?? null,
        goals: input.goals,
        sectors: input.sectorIds,
        visibleInTalentFeed: input.visibleInTalentFeed,
        completion: this.calculateCompletion(input),
      }
      return existing
        ? transaction.talentProfile.update({ where: { id: existing.id }, data, include: { field: true } })
        : transaction.talentProfile.create({ data: { ...data, userId, avatarSeed: this.avatarSeed(userId) }, include: { field: true } })
    })
    return { profile: this.serializeProfile(profile), minimumCompletion: MIN_PROFILE_COMPLETION }
  }

  private serializeProfile(profile: { id: string; userId: string; pseudonym: string; avatarSeed: string; headline: string | null; bio: string | null; fieldId: string | null; cohortYear: number | null; level: string | null; availabilityHours: number | null; goals: unknown; sectors: unknown; completion: number; visibleInTalentFeed: boolean; field?: { id: string; slug: string; labelKey: string } | null }) {
    return {
      id: profile.id,
      userId: profile.userId,
      pseudonym: profile.pseudonym,
      avatarSeed: profile.avatarSeed,
      headline: profile.headline,
      bio: profile.bio,
      fieldId: profile.fieldId,
      field: profile.field ?? null,
      cohortYear: profile.cohortYear,
      level: profile.level,
      availabilityHours: profile.availabilityHours,
      goals: Array.isArray(profile.goals) ? profile.goals : [],
      sectorIds: Array.isArray(profile.sectors) ? profile.sectors : [],
      completion: profile.completion,
      visibleInTalentFeed: profile.visibleInTalentFeed,
    }
  }

  private calculateCompletion(input: TalentProfileInput) {
    const checks = [Boolean(input.pseudonym), Boolean(input.headline), Boolean(input.bio), Boolean(input.fieldId), Boolean(input.cohortYear), input.availabilityHours !== undefined, input.goals.length > 0, input.sectorIds.length > 0]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }

  private avatarSeed(userId: string) { return `cofound-${userId.slice(0, 12)}` }
}
