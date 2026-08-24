import { Injectable } from '@nestjs/common'
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
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const profile = await this.prisma.talentProfile.findUnique({ where: { userId }, select: { completion: true, pseudonym: true, headline: true, bio: true, fieldId: true, cohortYear: true, availabilityHours: true, goals: true, sectors: true } })
    const completion = profile?.completion ?? 0
    const missingFields = profile ? MISSING_FIELDS.filter(([field]) => {
      const value = profile[field]
      return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
    }).map(([, key]) => key) : MISSING_FIELDS.map(([, key]) => key)
    return { shouldRemind: completion < MIN_PROFILE_COMPLETION, completion, minimumCompletion: MIN_PROFILE_COMPLETION, missingFields, ctaPath: '/onboarding' as const }
  }
}
