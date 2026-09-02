import { createHash, randomBytes } from 'node:crypto'
import { BadRequestException, ConflictException, Injectable, NotFoundException, Optional, Inject } from '@nestjs/common'
import * as argon2 from 'argon2'
import { organizationCapabilityUpdateSchema, organizationRequestDecisionSchema, organizationRequestQueueQuerySchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'
import { NotificationsQueueService } from '../notifications/notifications-queue.service.js'
import { CloudinaryService, type CloudinaryDocument } from './cloudinary.service.js'

const MVP_CAPABILITIES = new Set(['CERTIFY_AFFILIATION', 'PUBLISH_OPPORTUNITY', 'RECRUIT'])

function commercialDefaults(type: string) {
  if (type === 'INCUBATOR') return { plan: 'INCUBATOR_STARTER' as const, seatsLimit: 3, programsLimit: 1, cohortsLimit: 2, opportunitiesLimit: 3 }
  if (type === 'COMPANY') return { plan: 'COMPANY_STARTER' as const, seatsLimit: 3, programsLimit: 0, cohortsLimit: 0, opportunitiesLimit: 3 }
  if (type === 'NGO') return { plan: 'NGO_PROGRAM' as const, seatsLimit: 3, programsLimit: 1, cohortsLimit: 2, opportunitiesLimit: 3 }
  return { plan: 'FREE' as const, seatsLimit: 1, programsLimit: 0, cohortsLimit: 0, opportunitiesLimit: 3 }
}

@Injectable()
export class OrganizationRequestStaffService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService,
    @Optional() @Inject(CloudinaryService) private readonly cloudinary?: CloudinaryService,
    @Optional() @Inject(NotificationsQueueService) private readonly notificationsQueue?: NotificationsQueueService,
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

      const defaults = commercialDefaults(request.organizationType)
      const organization = await transaction.organization.create({
        data: {
          name: request.organizationName,
          type: request.organizationType,
          countryCode: request.countryCode,
          description: request.description,
          verificationStatus: 'VERIFIED',
          billingStatus: 'TRIAL',
          ...defaults,
        },
        select: { id: true, name: true, type: true, verificationStatus: true, plan: true, billingStatus: true, seatsLimit: true, programsLimit: true, cohortsLimit: true, opportunitiesLimit: true },
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

  async listOrganizations(query: { type?: string; status?: string; search?: string }) {
    const where: any = {}
    if (query.type) where.type = query.type
    if (query.status) where.verificationStatus = query.status
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' }
    }

    const orgs = await this.prisma.organization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        capabilities: { select: { capability: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
                talentIdentity: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            affiliations: true,
            importBatches: true,
            opportunities: true,
          },
        },
      },
    })

    const items = orgs.map((org) => {
      const adminMember = org.members.find((m) => m.role === 'ORG_ADMIN') ?? org.members[0]
      const primaryAdmin = adminMember
        ? {
            id: adminMember.user.id,
            email: adminMember.user.email,
            firstName: adminMember.user.talentIdentity?.firstName ?? null,
            lastName: adminMember.user.talentIdentity?.lastName ?? null,
            status: adminMember.user.status,
          }
        : null

      return {
        id: org.id,
        name: org.name,
        type: org.type,
        countryCode: org.countryCode,
        description: org.description,
        verificationStatus: org.verificationStatus,
        createdAt: org.createdAt,
        capabilities: org.capabilities.map((c) => c.capability),
        membersCount: org._count.members,
        affiliationsCount: org._count.affiliations,
        importBatchesCount: org._count.importBatches,
        projectsCount: org._count.opportunities,
        primaryAdmin,
      }
    })

    return { items, total: items.length }
  }

  async getOrganizationDetail(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        capabilities: { select: { capability: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
                talentIdentity: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        importBatches: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            affiliations: true,
            importBatches: true,
            opportunities: true,
          },
        },
      },
    })

    if (!org) throw new NotFoundException({ code: 'ORGANIZATION_NOT_FOUND', messageKey: 'errors.notFound' })

    const activatedCount = await this.prisma.affiliation.count({
      where: {
        organizationId,
        user: { status: 'ACTIVE' },
      },
    })

    const lastImport = org.importBatches[0]

    return {
      id: org.id,
      name: org.name,
      type: org.type,
      countryCode: org.countryCode,
      logoKey: org.logoKey,
      description: org.description,
      verificationStatus: org.verificationStatus,
      plan: org.plan,
      billingStatus: org.billingStatus,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      capabilities: org.capabilities.map((c) => c.capability),
      stats: {
        affiliationsCount: org._count.affiliations,
        activatedStudentsCount: activatedCount,
        activationRatePercent: org._count.affiliations > 0 ? Math.round((activatedCount / org._count.affiliations) * 100) : 0,
        projectsCount: org._count.opportunities,
        importBatchesCount: org._count.importBatches,
        lastImportDate: lastImport?.createdAt ?? null,
      },
      members: org.members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        email: m.user.email,
        firstName: m.user.talentIdentity?.firstName ?? null,
        lastName: m.user.talentIdentity?.lastName ?? null,
        role: m.role,
        status: m.user.status,
        createdAt: m.createdAt,
      })),
      importBatches: org.importBatches.map((b) => ({
        id: b.id,
        fileKey: b.fileKey,
        status: b.status,
        totalRows: b.totalRows,
        createdRows: b.createdRows,
        updatedRows: b.updatedRows,
        errorRows: b.errorRows,
        createdAt: b.createdAt,
      })),
    }
  }

  async createOrganization(actorId: string, input: any) {
    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')
    const tempPassword = this.generateTemporaryPassword()
    const passwordHash = await argon2.hash(tempPassword, { type: argon2.argon2id })
    const defaults = commercialDefaults(input.type)

    const result = await this.prisma.$transaction(async (transaction) => {
      const org = await transaction.organization.create({
        data: {
          name: input.name,
          type: input.type,
          countryCode: input.countryCode ?? 'MG',
          description: input.description ?? null,
          logoKey: input.logoKey ?? null,
          verificationStatus: 'VERIFIED',
          billingStatus: 'TRIAL',
          ...defaults,
        },
      })

      let user = await transaction.user.findUnique({ where: { email: input.adminEmail.toLowerCase() } })
      if (!user) {
        user = await transaction.user.create({
          data: {
            email: input.adminEmail.toLowerCase(),
            passwordHash,
            status: 'INVITED',
            platformRole: 'ORG_MEMBER',
            locale: 'fr',
          },
        })
      } else {
        user = await transaction.user.update({
          where: { id: user.id },
          data: { platformRole: 'ORG_MEMBER' },
        })
      }

      await transaction.talentIdentity.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          firstName: input.adminFirstName,
          lastName: input.adminLastName,
        },
        update: {
          firstName: input.adminFirstName,
          lastName: input.adminLastName,
        },
      })

      await transaction.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: 'ORG_ADMIN',
        },
      })

      // Capabilities
      if (Array.isArray(input.capabilities) && input.capabilities.length > 0) {
        for (const cap of input.capabilities) {
          if (cap === 'CERTIFY_AFFILIATION' && org.type !== 'INSTITUTION') continue
          await transaction.organizationCapability.create({
            data: {
              organizationId: org.id,
              capability: cap,
              grantedById: actorId,
            },
          })
        }
      }

      // Invitation token
      await transaction.invitationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      })

      return { org, user }
    })

    if (this.notificationsQueue) {
      await this.notificationsQueue.enqueue({
        kind: 'account.credentials',
        recipient: input.adminEmail.toLowerCase(),
        temporaryPassword: tempPassword,
        activationToken: rawToken,
        locale: 'fr',
      }).catch(() => undefined)
    }

    await this.audit.record({
      actorId,
      action: 'ORGANIZATION_PROVISIONED',
      targetType: 'Organization',
      targetId: result.org.id,
      metadata: { name: result.org.name, type: result.org.type, firstAdmin: result.user.email },
    })

    return result.org
  }

  async updateOrganization(actorId: string, organizationId: string, input: any) {
    const existing = await this.prisma.organization.findUnique({ where: { id: organizationId } })
    if (!existing) throw new NotFoundException({ code: 'ORGANIZATION_NOT_FOUND', messageKey: 'errors.notFound' })

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: input.name ?? undefined,
        type: input.type ?? undefined,
        countryCode: input.countryCode ?? undefined,
        description: input.description !== undefined ? input.description : undefined,
        verificationStatus: input.verificationStatus ?? undefined,
      },
    })

    await this.audit.record({
      actorId,
      action: 'ORGANIZATION_UPDATED',
      targetType: 'Organization',
      targetId: organizationId,
      metadata: { previousStatus: existing.verificationStatus, newStatus: updated.verificationStatus },
    })

    return updated
  }

  async suspendOrganization(actorId: string, organizationId: string, reason?: string) {
    const existing = await this.prisma.organization.findUnique({ where: { id: organizationId } })
    if (!existing) throw new NotFoundException({ code: 'ORGANIZATION_NOT_FOUND', messageKey: 'errors.notFound' })

    const nextStatus = existing.verificationStatus === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED'
    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { verificationStatus: nextStatus },
    })

    await this.audit.record({
      actorId,
      action: nextStatus === 'SUSPENDED' ? 'ORGANIZATION_SUSPENDED' : 'ORGANIZATION_REACTIVATED',
      targetType: 'Organization',
      targetId: organizationId,
      metadata: { reason: reason ?? 'Staff administrative action', newStatus: nextStatus },
    })

    return updated
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#'
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
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
