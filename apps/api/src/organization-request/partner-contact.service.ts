import { ConflictException, ForbiddenException, Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common'
import { organizationProjectContactInputSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'

@Injectable()
export class PartnerContactService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(AuditService) private readonly audit: AuditService) {}

  async contact(actorId: string, organizationId: string, projectId: string, body: unknown) {
    const membership = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: actorId } }, select: { role: true, user: { select: { status: true } }, organization: { select: { capabilities: { select: { capability: true } } } } } })
    if (!membership || membership.user.status !== 'ACTIVE' || !['ORG_ADMIN', 'ORG_MANAGER'].includes(membership.role) || !membership.organization.capabilities.some(({ capability }) => capability === 'RECRUIT')) throw new ForbiddenException({ code: 'ORGANIZATION_RECRUIT_REQUIRED', messageKey: 'errors.insufficientOrganizationCapability' })
    const parsed = organizationProjectContactInputSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const project = await this.prisma.project.findFirst({ where: { id: projectId, status: { in: ['RECRUITING', 'ACTIVE'] } }, select: { id: true } })
    if (!project) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.notFound' })
    const existing = await this.prisma.organizationProjectContact.findUnique({ where: { organizationId_projectId: { organizationId, projectId } }, select: { id: true } })
    if (existing) throw new ConflictException({ code: 'ORGANIZATION_CONTACT_ALREADY_SENT', messageKey: 'errors.contactAlreadySent' })
    const contact = await this.prisma.organizationProjectContact.create({ data: { organizationId, projectId, message: parsed.data.message }, select: { id: true, organizationId: true, projectId: true, message: true, createdAt: true } })
    await this.audit.record({ actorId, action: 'ORGANIZATION_PROJECT_CONTACT_SENT', targetType: 'OrganizationProjectContact', targetId: contact.id, metadata: { organizationId, projectId } })
    return contact
  }
}
