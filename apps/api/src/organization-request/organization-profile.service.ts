import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class OrganizationProfileService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getPublicProfile(organizationId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { id: organizationId, verificationStatus: 'VERIFIED' },
      select: {
        id: true,
        name: true,
        type: true,
        countryCode: true,
        logoKey: true,
        description: true,
        verificationStatus: true,
        capabilities: { select: { capability: true } },
      },
    })
    if (!organization) throw new NotFoundException({ code: 'ORGANIZATION_NOT_FOUND', messageKey: 'errors.notFound' })
    return {
      ...organization,
      capabilities: organization.capabilities.map(({ capability }) => capability),
    }
  }
}
