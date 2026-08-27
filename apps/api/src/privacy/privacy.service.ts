import { ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { publicTalentViewSchema, revealedTalentViewSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class PrivacyService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getTalentView(viewerId: string, talentId: string) {
    const talent = await this.prisma.talentProfile.findUnique({
      where: { id: talentId },
      select: {
        id: true,
        userId: true,
        pseudonym: true,
        avatarSeed: true,
        headline: true,
        bio: true,
        fieldId: true,
        cohortYear: true,
        availabilityHours: true,
        completion: true,
        user: { select: { status: true } },
      },
    })

    if (!talent || talent.user.status === 'DISABLED') {
      throw new NotFoundException({ code: 'NOT_FOUND', messageKey: 'talent.errors.notFound' })
    }

    const publicView = publicTalentViewSchema.parse({
      revealed: false,
      pseudonym: talent.pseudonym,
      avatarSeed: talent.avatarSeed,
      headline: talent.headline,
      bio: talent.bio,
      fieldId: talent.fieldId,
      cohortYear: talent.cohortYear,
      availabilityHours: talent.availabilityHours,
      completion: talent.completion,
    })

    if (viewerId !== talent.userId && !(await this.hasRevealedConnection(viewerId, talent.userId))) {
      return publicView
    }

    const identity = await this.prisma.talentIdentity.findUnique({
      where: { userId: talent.userId },
      select: { firstName: true, lastName: true, photoKey: true, phone: true },
    })

    if (!identity) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        messageKey: 'privacy.errors.identityUnavailable',
      })
    }

    return revealedTalentViewSchema.parse({ ...publicView, revealed: true, ...identity })
  }

  private async hasRevealedConnection(viewerId: string, talentUserId: string): Promise<boolean> {
    const connection = await this.prisma.connection.findFirst({
      where: {
        revealedAt: { not: null },
        OR: [
          { userAId: viewerId, userBId: talentUserId },
          { userAId: talentUserId, userBId: viewerId },
        ],
      },
      select: { id: true },
    })
    return Boolean(connection)
  }
}
