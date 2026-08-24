import { BadRequestException, ConflictException, Injectable, Optional, ServiceUnavailableException } from '@nestjs/common'
import { organizationRequestInputSchema, type OrganizationRequestInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { CloudinaryService, type UploadedFile } from './cloudinary.service.js'

@Injectable()
export class OrganizationRequestService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly cloudinary?: CloudinaryService,
  ) {}

  async create(body: unknown, files: UploadedFile[] = []) {
    const parsed = organizationRequestInputSchema.safeParse(this.prepareInput(body, files))
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

    const uploadedDocuments = files.length > 0
      ? await this.requireCloudinary().uploadDocuments(files)
      : []

    try {
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
          supportingDocuments: files.length > 0 ? uploadedDocuments : input.supportingDocuments,
        },
        select: { id: true, status: true, createdAt: true },
      })

      return {
        requestId: request.id,
        status: request.status,
        receivedAt: request.createdAt,
      }
    } catch (error) {
      await Promise.allSettled(uploadedDocuments.map((document) => this.requireCloudinary().destroy(document)))
      throw error
    }
  }

  private prepareInput(body: unknown, files: UploadedFile[]): unknown {
    if (!body || typeof body !== 'object') return body
    const input = { ...(body as Record<string, unknown>) }
    if (typeof input.sectorsOfInterest === 'string') input.sectorsOfInterest = this.parseJsonArray(input.sectorsOfInterest)
    if (typeof input.supportingDocuments === 'string') input.supportingDocuments = this.parseJsonArray(input.supportingDocuments)
    if (files.length > 0) {
      input.supportingDocuments = files.map((file) => ({ fileName: file.originalname, contentType: file.mimetype, sizeBytes: file.size }))
    }
    return input
  }

  private parseJsonArray(value: string): unknown[] {
    try {
      const parsed: unknown = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
  }

  private requireCloudinary() {
    if (!this.cloudinary) {
      throw new ServiceUnavailableException({
        code: 'FILE_STORAGE_NOT_CONFIGURED',
        messageKey: 'organizationRequest.errors.documentStorageUnavailable',
      })
    }
    return this.cloudinary
  }

  private normalize(input: OrganizationRequestInput): OrganizationRequestInput {
    return {
      ...input,
      countryCode: input.countryCode.toUpperCase(),
      contactEmail: input.contactEmail.toLowerCase(),
    }
  }
}
