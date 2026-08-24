import { BadRequestException, ConflictException, Injectable, NotFoundException, Optional } from '@nestjs/common'
import { organizationCapabilityUpdateSchema, organizationRequestDecisionSchema, organizationRequestQueueQuerySchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'
import { CloudinaryService, type CloudinaryDocument } from './cloudinary.service.js'

const MVP_CAPABILITIES = new Set(['CERTIFY_AFFILIATION', 'PUBLISH_OPPORTUNITY', 'RECRUIT'])

@Injectable()
export class OrganizationRequestStaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Optional() private readonly cloudinary?: CloudinaryService,
  ) {}

  async list(input: unknown) {
    const parsed = organizationRequestQueueQuerySchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const { status, cursor, limit } = parsed.data
    const rows = await this.prisma.organizationRequest.findMany({
      where: { status },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      take: limit + 1,
      select: {
        id: true, organizationType: true, organizationName: true, countryCode: true, region: true,
        website: true, description: true, sectorsOfInterest: true, contactName: true, contactRole: true,
        contactEmail: true, contactPhone: true, supportingDocuments: true, status: true,
        decisionReason: true, decidedAt: true, createdAt: true, approvedOrganizationId: true,
        approvedOrganization: { select: { capabilities: { select: { capability: true } } } },
      },
    })
    const hasMore = rows.length > limit
    const items = hasMore ? rows.slice(0, limit) : rows
    return { items: items.map((item) => this.serialize(item)), nextCursor: hasMore ? items.at(-1)?.id ?? null : null, hasMore }
  }

  async getById(requestId: string) {
    const request = await this.prisma.organizationRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true, organizationType: true, organizationName: true, countryCode: true, region: true,
        website: true, description: true, sectorsOfInterest: true, contactName: true, contactRole: true,
        contactEmail: true, contactPhone: true, supportingDocuments: true, status: true,
        decisionReason: true, decidedAt: true, createdAt: true, approvedOrganizationId: true,
        approvedOrganization: { select: { capabilities: { select: { capability: true } } } },
      },
    })
    if (!request) throw new NotFoundException({ code: 'ORGANIZATION_REQUEST_NOT_FOUND', messageKey: 'errors.notFound' })
    return this.serialize(request)
  }

  async getDocumentUrl(actorId: string, requestId: string, index: string) {
    const documentIndex = Number(index)
    if (!Number.isInteger(documentIndex) || documentIndex < 0) {
      throw new BadRequestException({ code: 'INVALID_DOCUMENT_INDEX', messageKey: 'organizationRequest.errors.documentNotFound' })
    }
    const request = await this.prisma.organizationRequest.findUnique({
      where: { id: requestId },
      select: { supportingDocuments: true },
    })
    if (!request) throw new NotFoundException({ code: 'ORGANIZATION_REQUEST_NOT_FOUND', messageKey: 'errors.notFound' })
    const value = Array.isArray(request.supportingDocuments) ? request.supportingDocuments[documentIndex] : undefined
    const document = this.asCloudinaryDocument(value)
    if (!document || !this.cloudinary) {
      throw new NotFoundException({ code: 'ORGANIZATION_REQUEST_DOCUMENT_NOT_FOUND', messageKey: 'organizationRequest.errors.documentNotFound' })
    }
    const access = this.cloudinary.createTemporaryDownloadUrl(document)
    await this.audit.record({ actorId, action: 'ORGANIZATION_REQUEST_DOCUMENT_ACCESSED', targetType: 'OrganizationRequest', targetId: requestId, metadata: { documentIndex } })
    return { fileName: document.fileName, url: access.url, expiresAt: access.expiresAt }
  }

  async approve(actorId: string, requestId: string) {
    const result = await this.prisma.$transaction(async (transaction) => {
      const request = await transaction.organizationRequest.findUnique({ where: { id: requestId } })
      if (!request) throw new NotFoundException({ code: 'ORGANIZATION_REQUEST_NOT_FOUND', messageKey: 'errors.notFound' })
      this.assertPending(request.status)

      const organization = await transaction.organization.create({
        data: {
          name: request.organizationName,
          type: request.organizationType,
          countryCode: request.countryCode,
          description: request.description,
          verificationStatus: 'VERIFIED',
        },
        select: { id: true, name: true, type: true, verificationStatus: true },
      })
      const existingUser = await transaction.user.findUnique({ where: { email: request.contactEmail } })
      const user = existingUser
        ? await transaction.user.update({ where: { id: existingUser.id }, data: { platformRole: 'ORG_MEMBER' }, select: { id: true, email: true, status: true } })
        : await transaction.user.create({ data: { email: request.contactEmail, status: 'INVITED', platformRole: 'ORG_MEMBER', locale: 'fr' }, select: { id: true, email: true, status: true } })
      await transaction.organizationMember.create({ data: { organizationId: organization.id, userId: user.id, role: 'ORG_ADMIN' } })
      const updatedRequest = await transaction.organizationRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', decidedAt: new Date(), approvedOrganizationId: organization.id },
        select: { id: true, status: true, approvedOrganizationId: true, decidedAt: true },
      })
      return { request: updatedRequest, organization, user }
    })
    await this.audit.record({ actorId, action: 'ORGANIZATION_REQUEST_APPROVED', targetType: 'OrganizationRequest', targetId: requestId, metadata: { organizationId: result.organization.id, firstAdminUserId: result.user.id } })
    return result
  }

  async reject(actorId: string, requestId: string, body: unknown) {
    const parsed = organizationRequestDecisionSchema.safeParse({ ...(body as Record<string, unknown>), action: 'REJECT' })
    if (!parsed.success || !parsed.data.reason) throw new BadRequestException({ code: 'REJECTION_REASON_REQUIRED', messageKey: 'organizationRequest.errors.rejectionReason', issues: parsed.success ? undefined : parsed.error.issues })
    const request = await this.prisma.organizationRequest.findUnique({ where: { id: requestId }, select: { id: true, status: true } })
    if (!request) throw new NotFoundException({ code: 'ORGANIZATION_REQUEST_NOT_FOUND', messageKey: 'errors.notFound' })
    this.assertPending(request.status)
    const updated = await this.prisma.organizationRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', decisionReason: parsed.data.reason, decidedAt: new Date() }, select: { id: true, status: true, decisionReason: true, decidedAt: true } })
    await this.audit.record({ actorId, action: 'ORGANIZATION_REQUEST_REJECTED', targetType: 'OrganizationRequest', targetId: requestId, metadata: { reasonProvided: true } })
    return updated
  }

  async grantCapability(actorId: string, organizationId: string, body: unknown) {
    const parsed = organizationCapabilityUpdateSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    if (!MVP_CAPABILITIES.has(parsed.data.capability)) throw new BadRequestException({ code: 'CAPABILITY_NOT_AVAILABLE', messageKey: 'organizationRequest.errors.capabilityNotAvailable' })
    const organization = await this.prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true, type: true } })
    if (!organization) throw new NotFoundException({ code: 'ORGANIZATION_NOT_FOUND', messageKey: 'errors.notFound' })
    if (parsed.data.capability === 'CERTIFY_AFFILIATION' && organization.type !== 'INSTITUTION') throw new BadRequestException({ code: 'CERTIFICATION_ONLY_FOR_INSTITUTION', messageKey: 'organizationRequest.errors.certificationOnlyInstitution' })
    const capability = await this.prisma.organizationCapability.upsert({
      where: { organizationId_capability: { organizationId, capability: parsed.data.capability } },
      update: {},
      create: { organizationId, capability: parsed.data.capability, grantedById: actorId },
      select: { id: true, organizationId: true, capability: true, grantedById: true, grantedAt: true },
    })
    await this.audit.record({ actorId, action: 'ORGANIZATION_CAPABILITY_GRANTED', targetType: 'OrganizationCapability', targetId: capability.id, metadata: { organizationId, capability: capability.capability } })
    return capability
  }

  async revokeCapability(actorId: string, organizationId: string, capabilityName: string) {
    const parsed = organizationCapabilityUpdateSchema.safeParse({ capability: capabilityName })
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const capability = await this.prisma.organizationCapability.findUnique({ where: { organizationId_capability: { organizationId, capability: parsed.data.capability } }, select: { id: true, capability: true } })
    if (!capability) throw new NotFoundException({ code: 'ORGANIZATION_CAPABILITY_NOT_FOUND', messageKey: 'errors.notFound' })
    await this.prisma.organizationCapability.delete({ where: { id: capability.id } })
    await this.audit.record({ actorId, action: 'ORGANIZATION_CAPABILITY_REVOKED', targetType: 'OrganizationCapability', targetId: capability.id, metadata: { organizationId, capability: capability.capability } })
    return { removed: true, capability: capability.capability }
  }

  private assertPending(status: string) {
    if (status !== 'PENDING') throw new ConflictException({ code: 'ORGANIZATION_REQUEST_ALREADY_DECIDED', messageKey: 'organizationRequest.errors.alreadyDecided' })
  }

  private serialize<T extends { sectorsOfInterest: unknown; supportingDocuments: unknown; approvedOrganization?: unknown }>(item: T) {
    return {
      ...item,
      sectorsOfInterest: this.asStringArray(item.sectorsOfInterest),
      supportingDocuments: this.asDocuments(item.supportingDocuments),
      capabilities: this.asCapabilities(item.approvedOrganization),
    }
  }

  private asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
  }

  private asCapabilities(value: unknown): string[] {
    if (!value || typeof value !== 'object') return []
    const capabilities = (value as { capabilities?: unknown }).capabilities
    if (!Array.isArray(capabilities)) return []
    return capabilities.flatMap((entry) => typeof entry === 'object' && entry !== null && typeof (entry as Record<string, unknown>).capability === 'string' ? [(entry as Record<string, unknown>).capability as string] : [])
  }

  private asDocuments(value: unknown): Array<{ fileName: string; contentType: string; sizeBytes: number }> {
    if (!Array.isArray(value)) return []
    return value.filter((entry): entry is { fileName: string; contentType: string; sizeBytes: number } => typeof entry === 'object' && entry !== null && typeof (entry as Record<string, unknown>).fileName === 'string' && typeof (entry as Record<string, unknown>).contentType === 'string' && typeof (entry as Record<string, unknown>).sizeBytes === 'number')
  }

  private asCloudinaryDocument(value: unknown): CloudinaryDocument | null {
    if (!value || typeof value !== 'object') return null
    const document = value as Record<string, unknown>
    if (typeof document.fileName !== 'string' || typeof document.contentType !== 'string' || typeof document.sizeBytes !== 'number') return null
    if (typeof document.cloudinaryPublicId !== 'string' || typeof document.cloudinaryFormat !== 'string' || typeof document.cloudinaryResourceType !== 'string' || document.cloudinaryResourceType !== 'image' && document.cloudinaryResourceType !== 'raw') return null
    if (typeof document.cloudinaryAssetId !== 'string' || typeof document.cloudinaryVersion !== 'number') return null
    return {
      fileName: document.fileName,
      contentType: document.contentType,
      sizeBytes: document.sizeBytes,
      cloudinaryPublicId: document.cloudinaryPublicId,
      cloudinaryResourceType: document.cloudinaryResourceType,
      cloudinaryDeliveryType: 'authenticated',
      cloudinaryFormat: document.cloudinaryFormat,
      cloudinaryAssetId: document.cloudinaryAssetId,
      cloudinaryVersion: document.cloudinaryVersion,
    }
  }
}
