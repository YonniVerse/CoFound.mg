import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { financialEngagementCreateSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'
import { OffPlatformPaymentProvider } from './off-platform-payment.provider.js'
import type { PaymentProvider } from './payment-provider.port.js'

@Injectable()
export class FinancialEngagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly paymentProvider: PaymentProvider = new OffPlatformPaymentProvider(),
  ) {}

  async create(actorId: string, organizationId: string, body: unknown) {
    const parsed = financialEngagementCreateSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const membership = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: actorId } }, select: { role: true, user: { select: { status: true } } } })
    if (!membership || membership.user.status !== 'ACTIVE' || !['ORG_ADMIN', 'ORG_MANAGER'].includes(membership.role)) throw new ForbiddenException({ code: 'ORGANIZATION_MANAGE_REQUIRED', messageKey: 'errors.insufficientOrganizationCapability' })
    const project = await this.prisma.project.findUnique({ where: { id: parsed.data.projectId }, select: { id: true } })
    if (!project) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.notFound' })
    const intent = await this.paymentProvider.createIntent({ amount: parsed.data.amount, currency: parsed.data.currency, type: parsed.data.type, projectId: parsed.data.projectId, organizationId })
    const engagement = await this.prisma.financialEngagement.create({ data: { projectId: parsed.data.projectId, organizationId, type: parsed.data.type, amount: parsed.data.amount, currency: parsed.data.currency, provider: parsed.data.provider, externalRef: parsed.data.externalRef ?? intent.externalRef, status: 'PROPOSED' }, select: { id: true, projectId: true, organizationId: true, type: true, amount: true, currency: true, provider: true, externalRef: true, status: true, createdAt: true } })
    await this.audit.record({ actorId, action: 'FINANCIAL_ENGAGEMENT_CREATED', targetType: 'FinancialEngagement', targetId: engagement.id, metadata: { organizationId, projectId: parsed.data.projectId, provider: parsed.data.provider } })
    return { ...engagement, amount: engagement.amount.toString() }
  }
}
