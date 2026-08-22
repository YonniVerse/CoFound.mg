import { ConflictException, Injectable, BadRequestException } from '@nestjs/common'
import { organizationRequestInputSchema, type OrganizationRequestInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class OrganizationRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: unknown) {
    const parsed = organizationRequestInputSchema.safeParse(body)
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        messageKey: 'organizationRequest.errors.invalidInput',
        details: { issues: parsed.error.issues },
      })
    }

    const input = this.normalize(parsed.data)
    const duplicate = await this.prisma.organizationRequest.findFirst({
      where: {
        status: { in: ['PENDING', 'APPROVED'] },
        contactEmail: { equals: input.contactEmail, mode: 'insensitive' },
        organizationName: { equals: input.organizationName, mode: 'insensitive' },
      },
      select: { id: true, status: true },
    })

    if (duplicate) {
      throw new ConflictException({
        code: 'CONFLICT',
        messageKey: 'organizationRequest.errors.duplicate',
        details: { requestId: duplicate.id, status: duplicate.status },
      })
    }

    const request = await this.prisma.organizationRequest.create({
      data: {
        organizationType: input.organizationType,
        organizationName: input.organizationName,
        countryCode: input.countryCode,
        region: input.region,
        website: input.website || null,
        description: input.description,
        sectorsOfInterest: input.sectorsOfInterest,
        contactName: input.contactName,
        contactRole: input.contactRole,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone || null,
        supportingDocuments: input.supportingDocuments,
      },
      select: { id: true, status: true, createdAt: true },
    })

    return {
      requestId: request.id,
      status: request.status,
      receivedAt: request.createdAt,
    }
  }

  private normalize(input: OrganizationRequestInput): OrganizationRequestInput {
    return {
      ...input,
      countryCode: input.countryCode.toUpperCase(),
      contactEmail: input.contactEmail.toLowerCase(),
    }
  }
}
