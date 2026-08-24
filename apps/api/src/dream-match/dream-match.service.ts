import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { dreamMatchUpsertRequestSchema } from '@cofound/shared'
import type { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class DreamMatchService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const talent = await this.prisma.talentProfile.findUnique({
      where: { userId },
      select: { id: true, dreamMatchProfile: { include: { skills: true } } },
    })
    if (!talent) throw new NotFoundException('Profil talent introuvable')
    return { profile: talent.dreamMatchProfile ? this.toResponse(talent.dreamMatchProfile) : null }
  }

  async upsertMine(userId: string, input: unknown) {
    const parsed = dreamMatchUpsertRequestSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const { consent, skills, sectors, ...data } = parsed.data
    if (!consent) throw new BadRequestException('Le consentement matching est requis')

    const talent = await this.prisma.talentProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!talent) throw new NotFoundException('Profil talent introuvable')

    return this.prisma.$transaction(async (tx) => {
      const [validSkills, validSectors] = await Promise.all([
        tx.skill.findMany({ where: { id: { in: skills.map((skill) => skill.skillId) }, isActive: true }, select: { id: true } }),
        tx.sector.findMany({ where: { id: { in: sectors }, isActive: true }, select: { id: true } }),
      ])
      if (validSkills.length !== new Set(skills.map((skill) => skill.skillId)).size) {
        throw new BadRequestException('Une compétence est invalide ou inactive')
      }
      if (validSectors.length !== new Set(sectors).size) {
        throw new BadRequestException('Un secteur est invalide ou inactif')
      }

      const profile = await tx.dreamMatchProfile.upsert({
        where: { talentId: talent.id },
        create: { talentId: talent.id, ...data, sectors: sectors as Prisma.InputJsonValue },
        update: { ...data, sectors: sectors as Prisma.InputJsonValue },
      })
      await tx.dreamMatchSkill.deleteMany({ where: { dreamId: profile.id } })
      if (skills.length > 0) {
        await tx.dreamMatchSkill.createMany({ data: skills.map((skill) => ({ dreamId: profile.id, skillId: skill.skillId, importance: skill.importance })) })
      }
      const complete = await tx.dreamMatchProfile.findUniqueOrThrow({ where: { id: profile.id }, include: { skills: true } })
      return { profile: this.toResponse(complete) }
    })
  }

  private toResponse(profile: { id: string; talentId: string; minAvailability: number | null; preferredTeamSize: number | null; institutionPref: string | null; sectors: unknown; skills: Array<{ skillId: string; importance: number }> }) {
    return {
      id: profile.id,
      talentId: profile.talentId,
      minAvailability: profile.minAvailability,
      preferredTeamSize: profile.preferredTeamSize,
      institutionPref: profile.institutionPref,
      sectors: Array.isArray(profile.sectors) ? profile.sectors.filter((value): value is string => typeof value === 'string') : [],
      skills: profile.skills.map(({ skillId, importance }) => ({ skillId, importance })),
    }
  }
}
