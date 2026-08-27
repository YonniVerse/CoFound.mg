import { Injectable, Inject } from '@nestjs/common'
import { MIN_PROFILE_COMPLETION } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

const MISSING_FIELDS = [
  ['pseudonym', 'profile.fields.pseudonym'],
  ['headline', 'profile.fields.headline'],
  ['bio', 'profile.fields.bio'],
  ['fieldId', 'profile.fields.field'],
  ['cohortYear', 'profile.fields.cohortYear'],
  ['availabilityHours', 'profile.fields.availability'],
  ['goals', 'profile.fields.goals'],
  ['sectors', 'profile.fields.sectors'],
] as const

@Injectable()
export class CompletionReminderService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const profile = await this.prisma.talentProfile.findUnique({ where: { userId }, select: { completion: true, pseudonym: true, headline: true, bio: true, fieldId: true, cohortYear: true, availabilityHours: true, goals: true, sectors: true } })
    const completion = profile ? (profile.completion ?? this.calculateCompletion(profile)) : 0
    const missingFields = profile ? MISSING_FIELDS.filter(([field]) => {

      const value = profile[field]
      return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
    }).map(([, key]) => key) : MISSING_FIELDS.map(([, key]) => key)
    return { shouldRemind: completion < MIN_PROFILE_COMPLETION, completion, minimumCompletion: MIN_PROFILE_COMPLETION, missingFields, ctaPath: '/onboarding' as const }
  }

  private calculateCompletion(profile: { pseudonym: string; headline: string | null; bio: string | null; fieldId: string | null; cohortYear: number | null; availabilityHours: number | null; goals: unknown; sectors: unknown }) {
    const goals = Array.isArray(profile.goals) ? profile.goals : []
    const sectors = Array.isArray(profile.sectors) ? profile.sectors : []
    const checks = [Boolean(profile.pseudonym), Boolean(profile.headline), Boolean(profile.bio), Boolean(profile.fieldId), Boolean(profile.cohortYear), profile.availabilityHours !== null && profile.availabilityHours !== undefined, goals.length > 0, sectors.length > 0]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }
}
