import { ConflictException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { createHash, randomBytes } from 'node:crypto'
import { AccountStatus, ImportBatchStatus, ImportRowResult, OrganizationRole } from '@prisma/client'
import { INVITATION_EXPIRY_DAYS } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { NotificationsQueueService } from '../notifications/notifications-queue.service.js'

type PendingInvitation = { recipient: string; activationToken: string; locale: 'fr' | 'mg' }

type BatchCounters = { totalRows: number; createdRows: number; updatedRows: number; skippedRows: number; errorRows: number; bouncedRows: number }

@Injectable()
export class ImportBatchService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(NotificationsQueueService) private readonly notificationsQueue: NotificationsQueueService) {}

  async list(actorId: string) {
    const organizationIds = await this.authorizedOrganizationIds(actorId, false)
    const batches = await this.prisma.importBatch.findMany({
      where: { organizationId: { in: organizationIds } },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, email: true } }, rows: { select: { result: true } } },
    })
    return batches.map((batch) => ({
      id: batch.id,
      organizationId: batch.organizationId,
      fileKey: batch.fileKey,
      status: batch.status,
      uploadedBy: batch.uploadedBy,
      createdAt: batch.createdAt,
      ...this.countRows(batch.rows),
    }))
  }

  async detail(batchId: string, actorId: string) {
    await this.assertBatchAccess(batchId, actorId, false)
    const batch = await this.prisma.importBatch.findUnique({
      where: { id: batchId },
      include: { uploadedBy: { select: { id: true, email: true } }, rows: { orderBy: { lineNumber: 'asc' }, include: { user: { select: { id: true, email: true, status: true } } } } },
    })
    if (!batch) throw new NotFoundException('Lot d’import introuvable.')
    return {
      id: batch.id,
      organizationId: batch.organizationId,
      fileKey: batch.fileKey,
      status: batch.status,
      uploadedBy: batch.uploadedBy,
      createdAt: batch.createdAt,
      counters: this.countRows(batch.rows),
      rows: batch.rows.map((row) => ({
        id: row.id,
        lineNumber: row.lineNumber,
        result: row.result,
        errorCode: row.errorCode,
        normalizedEmail: row.normalizedEmail,
        user: row.user,
      })),
      bouncedEmails: batch.rows.filter((row) => row.result === ImportRowResult.BOUNCED).map((row) => row.normalizedEmail).filter((email): email is string => Boolean(email)),
    }
  }

  async cancel(batchId: string, actorId: string, confirmation: string) {
    const batch = await this.assertBatchAccess(batchId, actorId, true)
    if (confirmation !== `ANNULER ${batchId}`) throw new ConflictException(`Saisissez ANNULER ${batchId} pour confirmer.`)
    if (batch.status === ImportBatchStatus.CANCELLED) return { batchId, status: ImportBatchStatus.CANCELLED, changed: false }
    if (batch.status !== ImportBatchStatus.PREVIEW) throw new ConflictException('Seul un lot en prévisualisation peut être annulé sans révoquer des comptes.')
    await this.prisma.importBatch.update({ where: { id: batchId }, data: { status: ImportBatchStatus.CANCELLED } })
    return { batchId, status: ImportBatchStatus.CANCELLED, changed: true }
  }

  async activationLinks(batchId: string, actorId: string) {
    await this.assertBatchAccess(batchId, actorId, true)
    return this.prisma.$transaction(async (transaction) => {
      const batch = await transaction.importBatch.findUnique({ where: { id: batchId }, include: { rows: { where: { result: ImportRowResult.CREATED }, include: { user: true }, orderBy: { lineNumber: 'asc' } } } })
      if (!batch) throw new NotFoundException('Lot d’import introuvable.')
      if (batch.status !== ImportBatchStatus.APPLIED) throw new ConflictException('Les liens ne sont disponibles qu’après application du lot.')
      const links: Array<{ email: string; url: string }> = []
      for (const row of batch.rows) {
        if (!row.user || row.user.status !== AccountStatus.INVITED) continue
        const token = randomBytes(32).toString('base64url')
        await transaction.invitationToken.create({ data: { userId: row.user.id, importBatchId: batch.id, tokenHash: this.hashToken(token), expiresAt: new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000) } })
        links.push({ email: row.user.email, url: `${process.env.WEB_APP_URL ?? 'http://localhost:5173'}/activation/${token}` })
      }
      return { batchId, links }
    })
  }

  async resendInvitations(batchId: string, actorId: string) {
    await this.assertBatchAccess(batchId, actorId, true)
    const invitations: PendingInvitation[] = []
    const result = await this.prisma.$transaction(async (transaction) => {
      const batch = await transaction.importBatch.findUnique({ where: { id: batchId }, include: { rows: { where: { result: ImportRowResult.CREATED }, include: { user: true }, orderBy: { lineNumber: 'asc' } } } })
      if (!batch) throw new NotFoundException('Lot d’import introuvable.')
      if (batch.status !== ImportBatchStatus.APPLIED) throw new ConflictException('Les invitations ne peuvent être relancées qu’après application du lot.')
      for (const row of batch.rows) {
        if (!row.user || row.user.status !== AccountStatus.INVITED) continue
        const rawToken = randomBytes(32).toString('base64url')
        await transaction.invitationToken.create({
          data: {
            userId: row.user.id,
            importBatchId: batch.id,
            tokenHash: this.hashToken(rawToken),
            expiresAt: new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
          },
        })
        invitations.push({ recipient: row.user.email, activationToken: rawToken, locale: row.user.locale === 'mg' ? 'mg' : 'fr' })
      }
      return { batchId, eligible: invitations.length }
    })
    for (const invitation of invitations) await this.notificationsQueue.enqueue({ kind: 'account.activation', ...invitation })
    return { ...result, queued: invitations.length }
  }

  private async assertBatchAccess(batchId: string, actorId: string, managerOnly: boolean) {
    const batch = await this.prisma.importBatch.findUnique({ where: { id: batchId } })
    if (!batch) throw new NotFoundException('Lot d’import introuvable.')
    const member = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId: batch.organizationId, userId: actorId } } })
    const allowedRoles = managerOnly ? [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_MANAGER] : [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_MANAGER, OrganizationRole.ORG_VIEWER]
    if (!member || !allowedRoles.includes(member.role)) throw new ForbiddenException('Vous ne pouvez pas accéder à ce lot.')
    return batch
  }

  private async authorizedOrganizationIds(actorId: string, managerOnly: boolean) {
    const roles = managerOnly ? [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_MANAGER] : [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_MANAGER, OrganizationRole.ORG_VIEWER]
    const members = await this.prisma.organizationMember.findMany({ where: { userId: actorId, role: { in: roles } }, select: { organizationId: true } })
    return members.map((member) => member.organizationId)
  }

  private countRows(rows: Array<{ result: ImportRowResult | null }>): BatchCounters {
    return {
      totalRows: rows.length,
      createdRows: rows.filter((row) => row.result === ImportRowResult.CREATED).length,
      updatedRows: rows.filter((row) => row.result === ImportRowResult.UPDATED).length,
      skippedRows: rows.filter((row) => row.result === ImportRowResult.SKIPPED_DUPLICATE).length,
      errorRows: rows.filter((row) => row.result === ImportRowResult.ERROR).length,
      bouncedRows: rows.filter((row) => row.result === ImportRowResult.BOUNCED).length,
    }
  }

  private hashToken(token: string) { return createHash('sha256').update(token).digest('hex') }
}
