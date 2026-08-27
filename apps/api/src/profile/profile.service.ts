import { BadRequestException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { ApiErrorCode, MIN_PROFILE_COMPLETION, talentIdentityInputSchema, talentProfilePatchSchema, type TalentIdentityInput, type TalentProfilePatchInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class ProfileService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

  async getIdentity(userId: string) {
    const identity = await this.prisma.talentIdentity.findUnique({ where: { userId }, select: { firstName: true, lastName: true, photoKey: true, phone: true, regionId: true, gender: true } })
    if (!identity) throw new NotFoundException({ code: ApiErrorCode.NOT_FOUND, messageKey: 'profile.errors.identityNotFound' })
    return identity
  }

  async updateIdentity(userId: string, rawInput: unknown) {
    const parsed = talentIdentityInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'profile.errors.invalidIdentity', details: { issues: parsed.error.issues } })
    }
    const input = parsed.data as TalentIdentityInput
    const identity = await this.prisma.$transaction(async (transaction) => {
      if (input.regionId) {
        const region = await transaction.region.findFirst({ where: { id: input.regionId, isActive: true }, select: { id: true } })
        if (!region) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'profile.errors.invalidRegion' })
      }
      return transaction.talentIdentity.upsert({
        where: { userId },
        create: { userId, firstName: input.firstName, lastName: input.lastName, photoKey: input.photoKey ?? null, phone: input.phone ?? null, regionId: input.regionId ?? null, gender: input.gender ?? null },
        update: { firstName: input.firstName, lastName: input.lastName, photoKey: input.photoKey ?? null, phone: input.phone ?? null, regionId: input.regionId ?? null, gender: input.gender ?? null },
        select: { firstName: true, lastName: true, photoKey: true, phone: true, regionId: true, gender: true },
      })
    })
    return { identity }
  }

  async updateMine(userId: string, rawInput: unknown) {
    const parsed = talentProfilePatchSchema.safeParse(rawInput)
    if (!parsed.success) {
      throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'profile.errors.invalidInput', details: { issues: parsed.error.issues } })
    }
    const input = parsed.data as TalentProfilePatchInput
    const profile = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.talentProfile.findUnique({ where: { userId } })
      if (!existing && !input.pseudonym) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'profile.errors.pseudonymRequired' })
      const currentGoals = Array.isArray(existing?.goals) ? existing.goals.filter((goal): goal is string => typeof goal === 'string') : []
      const currentSectorIds = Array.isArray(existing?.sectors) ? existing.sectors.filter((sector): sector is string => typeof sector === 'string') : []
      const effective = {
        pseudonym: input.pseudonym ?? existing?.pseudonym ?? '',
        headline: input.headline ?? existing?.headline ?? null,
        bio: input.bio ?? existing?.bio ?? null,
        fieldId: input.fieldId ?? existing?.fieldId ?? null,
        cohortYear: input.cohortYear ?? existing?.cohortYear ?? null,
        availabilityHours: input.availabilityHours ?? existing?.availabilityHours ?? null,
        goals: input.goals ?? currentGoals,
        sectorIds: input.sectorIds ?? currentSectorIds,
        visibleInTalentFeed: input.visibleInTalentFeed ?? existing?.visibleInTalentFeed ?? false,
      }
      if (effective.fieldId) {
        const field = await transaction.field.findFirst({ where: { id: effective.fieldId, isActive: true }, select: { id: true } })
        if (!field) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'profile.errors.invalidField' })
      }
      if (effective.sectorIds.length > 0) {
        const sectors = await transaction.sector.findMany({ where: { id: { in: effective.sectorIds }, isActive: true }, select: { id: true } })
        if (sectors.length !== new Set(effective.sectorIds).size) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'profile.errors.invalidSector' })
      }
      const completion = this.calculateCompletion(effective)
      const data = {
        pseudonym: effective.pseudonym,
        headline: effective.headline || null,
        bio: effective.bio || null,
        fieldId: effective.fieldId,
        cohortYear: effective.cohortYear,
        availabilityHours: effective.availabilityHours,
        goals: effective.goals,
        sectors: effective.sectorIds,
        visibleInTalentFeed: effective.visibleInTalentFeed && completion >= MIN_PROFILE_COMPLETION,
        completion,
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

  private calculateCompletion(input: { pseudonym: string; headline: string | null; bio: string | null; fieldId: string | null; cohortYear: number | null; availabilityHours: number | null; goals: string[]; sectorIds: string[] }) {
    const checks = [Boolean(input.pseudonym), Boolean(input.headline), Boolean(input.bio), Boolean(input.fieldId), Boolean(input.cohortYear), input.availabilityHours !== null && input.availabilityHours !== undefined, input.goals.length > 0, input.sectorIds.length > 0]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }

  private avatarSeed(userId: string) { return `cofound-${userId.slice(0, 12)}` }
}
