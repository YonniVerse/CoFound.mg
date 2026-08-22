import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { opportunityApplicationCreateSchema, opportunityApplicationDecisionSchema, opportunityCreateSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'

@Injectable()
export class OpportunityService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async listPublished() {
    return this.prisma.opportunity.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }], select: this.opportunitySelect() })
  }

  async create(actorId: string, organizationId: string, input: unknown) {
    await this.assertCapability(actorId, organizationId, 'PUBLISH_OPPORTUNITY')
    const parsed = opportunityCreateSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const opportunity = await this.prisma.opportunity.create({ data: { organizationId, type: parsed.data.type, title: parsed.data.title, description: parsed.data.description, eligibility: parsed.data.eligibility || null, deadline: parsed.data.deadline ?? null, seats: parsed.data.seats ?? null, status: 'DRAFT' }, select: this.opportunitySelect() })
    await this.audit.record({ actorId, action: 'OPPORTUNITY_CREATED', targetType: 'Opportunity', targetId: opportunity.id, metadata: { organizationId } })
    return opportunity
  }

  async publish(actorId: string, organizationId: string, opportunityId: string) {
    await this.assertCapability(actorId, organizationId, 'PUBLISH_OPPORTUNITY')
    const current = await this.prisma.opportunity.findFirst({ where: { id: opportunityId, organizationId }, select: { id: true, status: true } })
    if (!current) throw new NotFoundException({ code: 'OPPORTUNITY_NOT_FOUND', messageKey: 'errors.notFound' })
    if (current.status !== 'DRAFT') throw new ConflictException({ code: 'OPPORTUNITY_ALREADY_PUBLISHED', messageKey: 'errors.alreadyProcessed' })
    const opportunity = await this.prisma.opportunity.update({ where: { id: opportunityId }, data: { status: 'PUBLISHED' }, select: this.opportunitySelect() })
    await this.audit.record({ actorId, action: 'OPPORTUNITY_PUBLISHED', targetType: 'Opportunity', targetId: opportunityId, metadata: { organizationId } })
    return opportunity
  }

  async listApplications(actorId: string, organizationId: string, opportunityId: string) {
    await this.assertCapability(actorId, organizationId, 'PUBLISH_OPPORTUNITY')
    await this.assertOpportunity(organizationId, opportunityId)
    return this.prisma.opportunityApplication.findMany({ where: { opportunityId }, orderBy: { createdAt: 'asc' }, select: { id: true, opportunityId: true, applicantType: true, applicantId: true, message: true, status: true, rejectionReason: true, createdAt: true } })
  }

  async apply(actorId: string, opportunityId: string, input: unknown) {
    const parsed = opportunityApplicationCreateSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const opportunity = await this.prisma.opportunity.findUnique({ where: { id: opportunityId }, select: { id: true, status: true } })
    if (!opportunity || opportunity.status !== 'PUBLISHED') throw new NotFoundException({ code: 'OPPORTUNITY_NOT_FOUND', messageKey: 'errors.notFound' })
    await this.assertApplicant(actorId, parsed.data.applicantType, parsed.data.applicantId)
    const existing = await this.prisma.opportunityApplication.findUnique({ where: { opportunityId_applicantType_applicantId: { opportunityId, applicantType: parsed.data.applicantType, applicantId: parsed.data.applicantId } }, select: { id: true } })
    if (existing) throw new ConflictException({ code: 'OPPORTUNITY_APPLICATION_EXISTS', messageKey: 'errors.alreadyProcessed' })
    return this.prisma.opportunityApplication.create({ data: { opportunityId, applicantType: parsed.data.applicantType, applicantId: parsed.data.applicantId, message: parsed.data.message, status: 'PENDING' }, select: { id: true, opportunityId: true, applicantType: true, applicantId: true, message: true, status: true, rejectionReason: true, createdAt: true } })
  }

  async decideApplication(actorId: string, organizationId: string, applicationId: string, input: unknown) {
    await this.assertCapability(actorId, organizationId, 'PUBLISH_OPPORTUNITY')
    const parsed = opportunityApplicationDecisionSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const application = await this.prisma.opportunityApplication.findUnique({ where: { id: applicationId }, select: { id: true, status: true, opportunity: { select: { organizationId: true } } } })
    if (!application || application.opportunity.organizationId !== organizationId) throw new NotFoundException({ code: 'OPPORTUNITY_APPLICATION_NOT_FOUND', messageKey: 'errors.notFound' })
    if (application.status !== 'PENDING') throw new ConflictException({ code: 'OPPORTUNITY_APPLICATION_ALREADY_DECIDED', messageKey: 'errors.alreadyProcessed' })
    const updated = await this.prisma.opportunityApplication.update({ where: { id: applicationId }, data: { status: parsed.data.status, rejectionReason: parsed.data.status === 'REJECTED' ? parsed.data.rejectionReason : null }, select: { id: true, opportunityId: true, applicantType: true, applicantId: true, message: true, status: true, rejectionReason: true, createdAt: true } })
    await this.audit.record({ actorId, action: 'OPPORTUNITY_APPLICATION_DECIDED', targetType: 'OpportunityApplication', targetId: applicationId, metadata: { organizationId, status: parsed.data.status } })
    return updated
  }

  private async assertCapability(actorId: string, organizationId: string, capability: string) {
    const membership = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: actorId } }, select: { user: { select: { status: true } }, role: true, organization: { select: { capabilities: { select: { capability: true } } } } } })
    if (!membership || membership.user.status !== 'ACTIVE' || !membership.organization.capabilities.some((item) => item.capability === capability) || !['ORG_ADMIN', 'ORG_MANAGER'].includes(membership.role)) throw new ForbiddenException({ code: 'ORGANIZATION_CAPABILITY_REQUIRED', messageKey: 'errors.insufficientOrganizationCapability' })
  }

  private async assertOpportunity(organizationId: string, opportunityId: string) {
    const opportunity = await this.prisma.opportunity.findFirst({ where: { id: opportunityId, organizationId }, select: { id: true } })
    if (!opportunity) throw new NotFoundException({ code: 'OPPORTUNITY_NOT_FOUND', messageKey: 'errors.notFound' })
    return opportunity
  }

  private async assertApplicant(actorId: string, applicantType: 'TALENT' | 'PROJECT', applicantId: string) {
    if (applicantType === 'TALENT') {
      if (applicantId !== actorId) throw new ForbiddenException({ code: 'APPLICANT_MISMATCH', messageKey: 'errors.forbidden' })
      const user = await this.prisma.user.findUnique({ where: { id: actorId }, select: { id: true, status: true, platformRole: true } })
      if (!user || user.status !== 'ACTIVE' || user.platformRole !== 'TALENT') throw new ForbiddenException({ code: 'TALENT_APPLICANT_REQUIRED', messageKey: 'errors.forbidden' })
      return
    }
    const member = await this.prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: applicantId, userId: actorId } }, select: { id: true } })
    if (!member) throw new ForbiddenException({ code: 'PROJECT_MEMBER_REQUIRED', messageKey: 'errors.forbidden' })
  }

  private opportunitySelect() {
    return { id: true, organizationId: true, type: true, title: true, description: true, eligibility: true, deadline: true, seats: true, status: true, createdAt: true, updatedAt: true } as const
  }
}
