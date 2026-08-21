import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ApiErrorCode, onboardingStepRequestSchema, talentIdentityInputSchema, talentProfilePatchSchema, type OnboardingStepRequest } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { ProfileService } from '../profile/profile.service.js'

const STEP_NAMES = ['identity', 'journey', 'skills', 'goals', 'availability', 'visibility'] as const

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService, private readonly profileService: ProfileService) {}

  async getMine(userId: string) {
    const profile = await this.prisma.talentProfile.findUnique({ where: { userId }, select: { id: true, completion: true, onboardingStep: true, onboardingCompletedSteps: true } })
    const completedSteps = this.readCompleted(profile?.onboardingCompletedSteps)
    const currentStep = profile?.onboardingStep ?? 1
    return { progress: this.progress(currentStep, completedSteps, profile?.completion ?? 0), profile: profile ? { id: profile.id, completion: profile.completion } : null }
  }

  async saveStep(userId: string, rawInput: unknown) {
    const parsed = onboardingStepRequestSchema.safeParse(rawInput)
    if (!parsed.success) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'onboarding.errors.invalidStep', details: { issues: parsed.error.issues } })
    const input = parsed.data as OnboardingStepRequest
    await this.validateStep(input.step, input.data)
    if (input.step === 1) {
      await this.profileService.updateIdentity(userId, input.data)
    } else if (input.step === 6) {
      await this.profileService.updateMine(userId, input.data)
      const identity = await this.prisma.talentIdentity.findUnique({ where: { userId }, select: { firstName: true, lastName: true, photoKey: true, phone: true, regionId: true } })
      if (identity) await this.profileService.updateIdentity(userId, { ...identity, gender: input.data.gender ?? null })
    } else if (input.step === 3) {
      await this.saveSkills(userId, input.data)
    } else {
      await this.profileService.updateMine(userId, input.data)
    }
    return this.prisma.$transaction(async (transaction) => {
      const profile = await transaction.talentProfile.findUnique({ where: { userId }, select: { id: true, completion: true, onboardingStep: true, onboardingCompletedSteps: true } })
      if (!profile) throw new NotFoundException({ code: ApiErrorCode.NOT_FOUND, messageKey: 'profile.errors.notFound' })
      const completed = new Set(this.readCompleted(profile.onboardingCompletedSteps))
      completed.add(input.step)
      const nextStep = Math.min(6, Math.max(profile.onboardingStep, input.step + 1))
      const updated = await transaction.talentProfile.update({ where: { id: profile.id }, data: { onboardingStep: nextStep, onboardingCompletedSteps: [...completed].sort((a, b) => a - b), onboardingUpdatedAt: new Date() }, select: { id: true, completion: true, onboardingStep: true, onboardingCompletedSteps: true } })
      return { progress: this.progress(updated.onboardingStep, this.readCompleted(updated.onboardingCompletedSteps), updated.completion), profile: { id: updated.id, completion: updated.completion } }
    })
  }

  private async validateStep(step: number, data: Record<string, unknown>) {
    const schema = step === 1 ? talentIdentityInputSchema : step === 2 ? talentProfilePatchSchema.pick({ fieldId: true, cohortYear: true }) : step === 4 ? talentProfilePatchSchema.pick({ goals: true, sectorIds: true }) : step === 5 ? talentProfilePatchSchema.pick({ availabilityHours: true }) : step === 6 ? talentProfilePatchSchema.pick({ pseudonym: true, visibleInTalentFeed: true }) : null
    if (schema && !schema.safeParse(data).success) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'onboarding.errors.invalidData' })
    if (step === 3) {
      const skillIds = data.skillIds
      if (!Array.isArray(skillIds) || skillIds.length < 3 || skillIds.length > 8 || new Set(skillIds).size !== skillIds.length || skillIds.some((id) => typeof id !== 'string')) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'onboarding.errors.invalidSkills' })
    }
  }

  private async saveSkills(userId: string, data: Record<string, unknown>) {
    const skillIds = data.skillIds as string[]
    await this.prisma.$transaction(async (transaction) => {
      const profile = await transaction.talentProfile.findUnique({ where: { userId }, select: { id: true } })
      if (!profile) throw new NotFoundException({ code: ApiErrorCode.NOT_FOUND, messageKey: 'profile.errors.notFound' })
      const activeSkills = await transaction.skill.findMany({ where: { id: { in: skillIds }, isActive: true }, select: { id: true } })
      if (activeSkills.length !== skillIds.length) throw new BadRequestException({ code: ApiErrorCode.VALIDATION_FAILED, messageKey: 'onboarding.errors.invalidSkills' })
      await transaction.talentSkill.deleteMany({ where: { talentId: profile.id } })
      await transaction.talentSkill.createMany({ data: skillIds.map((skillId) => ({ talentId: profile.id, skillId })) })
    })
  }

  private readCompleted(value: unknown): number[] { return Array.isArray(value) ? value.filter((step): step is number => Number.isInteger(step) && step >= 1 && step <= 6) : [] }
  private progress(currentStep: number, completedSteps: number[], completion: number) { return { currentStep, completedSteps, completion, minimumCompletion: 60, isComplete: completion >= 100, stepName: STEP_NAMES[currentStep - 1] ?? 'identity' } }
}
