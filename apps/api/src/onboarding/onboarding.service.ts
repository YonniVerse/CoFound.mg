import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ApiErrorCode, MIN_PROFILE_COMPLETION, onboardingStepRequestSchema, talentIdentityInputSchema, talentProfilePatchSchema, type OnboardingStepRequest } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

const STEP_NAMES = ['identity', 'journey', 'skills', 'goals', 'availability', 'visibility'] as const

type ProfileState = { id: string; completion: number; onboardingStep: number; onboardingCompletedSteps: unknown; pseudonym: string; headline: string | null; bio: string | null; fieldId: string | null; cohortYear: number | null; availabilityHours: number | null; goals: unknown; sectors: unknown; visibleInTalentFeed: boolean }

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const profile = await this.prisma.talentProfile.findUnique({ where: { userId }, select: { id: true, completion: true, onboardingStep: true, onboardingCompletedSteps: true } })
    const completedSteps = this.readCompleted(profile?.onboardingCompletedSteps)
    return { progress: this.progress(profile?.onboardingStep ?? 1, completedSteps, profile?.completion ?? 0), profile: profile ? { id: profile.id, completion: profile.completion } : null }
  }

  async saveStep(userId: string, rawInput: unknown) {
    const parsed = onboardingStepRequestSchema.safeParse(rawInput)
    if (!parsed.success) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'onboarding.errors.invalidStep', details: { issues: parsed.error.issues } })
    const input = parsed.data as OnboardingStepRequest
    await this.validateStep(input.step, input.data)
    return this.prisma.$transaction(async (transaction) => {
      let profile = await transaction.talentProfile.findUnique({ where: { userId } }) as ProfileState | null
      if (profile && input.step > profile.onboardingStep) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'onboarding.errors.previousStepRequired' })
      if (input.step === 1) {
        const identity = talentIdentityInputSchema.parse(input.data)
        profile = profile ?? await transaction.talentProfile.create({ data: { userId, pseudonym: `talent-${userId.slice(0, 8)}`, avatarSeed: `cofound-${userId.slice(0, 12)}` } }) as ProfileState
        await transaction.talentIdentity.upsert({ where: { userId }, create: { userId, ...identity }, update: identity })
      } else {
        if (!profile) throw new NotFoundException({ code: ApiErrorCode.NOT_FOUND, messageKey: 'profile.errors.notFound' })
        if (input.step === 3) {
          const skillIds = input.data.skillIds as string[]
          const activeSkills = await transaction.skill.findMany({ where: { id: { in: skillIds }, isActive: true }, select: { id: true } })
          if (activeSkills.length !== skillIds.length) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'onboarding.errors.invalidSkills' })
          await transaction.talentSkill.deleteMany({ where: { talentId: profile.id } })
          await transaction.talentSkill.createMany({ data: skillIds.map((skillId) => ({ talentId: profile!.id, skillId })) })
        } else {
          const data = input.data
          if (input.step === 2 && typeof data.fieldId === 'string') {
            const field = await transaction.field.findFirst({ where: { id: data.fieldId, isActive: true }, select: { id: true } })
            if (!field) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'profile.errors.invalidField' })
          }
          if (input.step === 4 && Array.isArray(data.sectorIds)) {
            const ids = data.sectorIds.filter((id): id is string => typeof id === 'string')
            const sectors = await transaction.sector.findMany({ where: { id: { in: ids }, isActive: true }, select: { id: true } })
            if (sectors.length !== new Set(ids).size) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'profile.errors.invalidSector' })
          }
          const current = profile
          const goals = input.step === 4 && Array.isArray(data.goals) ? data.goals : this.asStrings(current.goals)
          const sectors = input.step === 4 && Array.isArray(data.sectorIds) ? data.sectorIds : this.asStrings(current.sectors)
          const updated = await transaction.talentProfile.update({ where: { id: current.id }, data: { pseudonym: typeof data.pseudonym === 'string' ? data.pseudonym : current.pseudonym, bio: typeof data.bio === 'string' ? data.bio : current.bio, fieldId: typeof data.fieldId === 'string' ? data.fieldId : current.fieldId, cohortYear: typeof data.cohortYear === 'number' ? data.cohortYear : current.cohortYear, availabilityHours: typeof data.availabilityHours === 'number' ? data.availabilityHours : current.availabilityHours, goals, sectors, visibleInTalentFeed: typeof data.visibleInTalentFeed === 'boolean' ? data.visibleInTalentFeed : current.visibleInTalentFeed, completion: this.calculateCompletion({ ...current, pseudonym: typeof data.pseudonym === 'string' ? data.pseudonym : current.pseudonym, bio: typeof data.bio === 'string' ? data.bio : current.bio, fieldId: typeof data.fieldId === 'string' ? data.fieldId : current.fieldId, cohortYear: typeof data.cohortYear === 'number' ? data.cohortYear : current.cohortYear, availabilityHours: typeof data.availabilityHours === 'number' ? data.availabilityHours : current.availabilityHours, goals, sectors }) } }) as ProfileState
          profile = updated
          if (input.step === 6 && typeof data.gender === 'string') {
            const identity = await transaction.talentIdentity.findUnique({ where: { userId }, select: { firstName: true, lastName: true, photoKey: true, phone: true, regionId: true } })
            if (identity) await transaction.talentIdentity.update({ where: { userId }, data: { ...identity, gender: data.gender } })
          }
        }
      }
      const current = profile!
      const completed = new Set(this.readCompleted(current.onboardingCompletedSteps)); completed.add(input.step)
      const updated = await transaction.talentProfile.update({ where: { id: current.id }, data: { onboardingStep: Math.min(6, Math.max(current.onboardingStep, input.step + 1)), onboardingCompletedSteps: [...completed].sort((a, b) => a - b), onboardingUpdatedAt: new Date() }, select: { id: true, completion: true, onboardingStep: true, onboardingCompletedSteps: true } })
      return { progress: this.progress(updated.onboardingStep, this.readCompleted(updated.onboardingCompletedSteps), updated.completion), profile: { id: updated.id, completion: updated.completion } }
    })
  }

  private async validateStep(step: number, data: Record<string, unknown>) {
    const schema = step === 1 ? talentIdentityInputSchema : step === 2 ? talentProfilePatchSchema.pick({ fieldId: true, cohortYear: true }) : step === 4 ? talentProfilePatchSchema.pick({ goals: true, sectorIds: true }) : step === 5 ? talentProfilePatchSchema.pick({ availabilityHours: true }) : step === 6 ? talentProfilePatchSchema.pick({ pseudonym: true, bio: true, visibleInTalentFeed: true }) : null
    if (schema && !schema.safeParse(data).success) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'onboarding.errors.invalidData' })
    if (step === 3 && (!Array.isArray(data.skillIds) || data.skillIds.length < 3 || data.skillIds.length > 8 || new Set(data.skillIds).size !== data.skillIds.length || data.skillIds.some((id) => typeof id !== 'string'))) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'onboarding.errors.invalidSkills' })
  }
  private asStrings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [] }
  private readCompleted(value: unknown): number[] { return Array.isArray(value) ? value.filter((step): step is number => Number.isInteger(step) && step >= 1 && step <= 6) : [] }
  private calculateCompletion(input: { pseudonym: string; headline: string | null; bio: string | null; fieldId: string | null; cohortYear: number | null; availabilityHours: number | null; goals: string[]; sectors: string[] }) { const checks = [Boolean(input.pseudonym), Boolean(input.headline), Boolean(input.bio), Boolean(input.fieldId), Boolean(input.cohortYear), input.availabilityHours !== null, input.goals.length > 0, input.sectors.length > 0]; return Math.round((checks.filter(Boolean).length / checks.length) * 100) }
  private progress(currentStep: number, completedSteps: number[], completion: number) { return { currentStep, completedSteps, completion, minimumCompletion: MIN_PROFILE_COMPLETION, isComplete: completion >= 100, stepName: STEP_NAMES[currentStep - 1] ?? 'identity' } }
}
