import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { Wallet, WalletTransaction } from '@prisma/client'
import { walletOperationSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'

@Injectable()
export class WalletService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  async getOrganizationWallet(actorId: string, organizationId: string) {
    await this.assertOrganizationManager(actorId, organizationId)
    const wallet = await this.prisma.wallet.upsert({
      where: { organizationId },
      create: { organizationId, ownerType: 'ORGANIZATION', currency: 'MGA' },
      update: {},
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 100 } },
    })
    return this.toResponse(wallet)
  }

  async getProjectWallet(actorId: string, projectId: string) {
    await this.assertProjectManager(actorId, projectId)
    const wallet = await this.prisma.wallet.upsert({
      where: { projectId },
      create: { projectId, ownerType: 'PROJECT', currency: 'MGA' },
      update: {},
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 100 } },
    })
    return this.toResponse(wallet)
  }

  async creditOrganization(actorId: string, organizationId: string, body: unknown) {
    await this.assertOrganizationManager(actorId, organizationId)
    return this.mutate(actorId, { organizationId, ownerType: 'ORGANIZATION' }, 'CREDIT', body)
  }

  async debitOrganization(actorId: string, organizationId: string, body: unknown) {
    await this.assertOrganizationManager(actorId, organizationId)
    return this.mutate(actorId, { organizationId, ownerType: 'ORGANIZATION' }, 'DEBIT', body)
  }

  async creditProject(actorId: string, projectId: string, body: unknown) {
    await this.assertProjectManager(actorId, projectId)
    return this.mutate(actorId, { projectId, ownerType: 'PROJECT' }, 'CREDIT', body)
  }

  async debitProject(actorId: string, projectId: string, body: unknown) {
    await this.assertProjectManager(actorId, projectId)
    return this.mutate(actorId, { projectId, ownerType: 'PROJECT' }, 'DEBIT', body)
  }

  private async mutate(actorId: string, owner: { organizationId?: string; projectId?: string; ownerType: 'ORGANIZATION' | 'PROJECT' }, type: 'CREDIT' | 'DEBIT', body: unknown) {
    const parsed = walletOperationSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    if (parsed.data.currency !== 'MGA') throw new BadRequestException({ code: 'WALLET_CURRENCY_UNSUPPORTED', messageKey: 'errors.unsupportedCurrency' })
    const wallet = await this.prisma.$transaction(async (tx) => {
      const current = await tx.wallet.upsert({
        where: owner.organizationId ? { organizationId: owner.organizationId } : { projectId: owner.projectId },
        create: { ...owner, currency: parsed.data.currency },
        update: {},
      })
      const amount = new Prisma.Decimal(parsed.data.amount)
      const balance = type === 'CREDIT' ? current.balance.add(amount) : current.balance.sub(amount)
      if (type === 'DEBIT' && balance.lessThan(0)) throw new BadRequestException({ code: 'WALLET_INSUFFICIENT_FUNDS', messageKey: 'errors.walletInsufficientFunds' })
      await tx.wallet.update({ where: { id: current.id }, data: { balance } })
      await tx.walletTransaction.create({ data: { walletId: current.id, type, amount, currency: parsed.data.currency, description: parsed.data.description, referenceType: parsed.data.referenceType, referenceId: parsed.data.referenceId, createdById: actorId } })
      return tx.wallet.findUniqueOrThrow({ where: { id: current.id }, include: { transactions: { orderBy: { createdAt: 'desc' }, take: 100 } } })
    })
    await this.audit.record({ actorId, action: `WALLET_${type}`, targetType: 'Wallet', targetId: wallet.id, metadata: { ownerType: owner.ownerType, organizationId: owner.organizationId, projectId: owner.projectId, amount: parsed.data.amount, currency: parsed.data.currency } })
    return this.toResponse(wallet)
  }

  private toResponse(wallet: Wallet & { transactions: WalletTransaction[] }) {
    return {
      id: wallet.id,
      ownerType: wallet.ownerType,
      organizationId: wallet.organizationId,
      projectId: wallet.projectId,
      currency: wallet.currency,
      balance: wallet.balance.toString(),
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      transactions: wallet.transactions.map((transaction) => ({ ...transaction, amount: transaction.amount.toString() })),
    }
  }

  private async assertOrganizationManager(actorId: string, organizationId: string) {
    const membership = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: actorId } }, select: { role: true, user: { select: { status: true } } } })
    if (!membership || membership.user.status !== 'ACTIVE' || !['ORG_ADMIN', 'ORG_MANAGER'].includes(membership.role)) throw new ForbiddenException({ code: 'ORGANIZATION_MANAGE_REQUIRED', messageKey: 'errors.forbidden' })
  }

  private async assertProjectManager(actorId: string, projectId: string) {
    const member = await this.prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: actorId } }, select: { role: true, user: { select: { status: true } } } })
    if (!member || member.user.status !== 'ACTIVE' || member.role !== 'OWNER') throw new ForbiddenException({ code: 'PROJECT_OWNER_REQUIRED', messageKey: 'errors.forbidden' })
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true } })
    if (!project) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.notFound' })
  }
}
