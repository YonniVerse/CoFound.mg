import { ConflictException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { createHash, randomBytes } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { ImportBatchStatus, ImportRowResult } from '@prisma/client'
import type { ImportApplyInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { NotificationsQueueService } from '../notifications/notifications-queue.service.js'

const REQUIRED_FIELDS = ['email', 'firstName', 'lastName', 'fieldOfStudy', 'level', 'entryYear'] as const

type ImportStudent = {
  email?: unknown
  firstName?: unknown
  lastName?: unknown
  fieldOfStudy?: unknown
  level?: unknown
  entryYear?: unknown
  gender?: unknown
  studentNumber?: unknown
}

type PendingInvitation = {
  recipient: string
  activationToken: string
  locale: 'fr' | 'mg'
}

export type ImportApplyResult = {
  batchId: string
  status: 'APPLIED'
  totalRows: number
  createdRows: number
  updatedRows: number
  skippedRows: number
  errorRows: number
}

@Injectable()
export class ImportApplyService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(NotificationsQueueService) private readonly notificationsQueue: NotificationsQueueService) {}

  async apply(input: ImportApplyInput, actorId: string): Promise<ImportApplyResult> {
    const invitations: PendingInvitation[] = []
    const result = await this.prisma.$transaction(async (transaction) => {
      const batch = await transaction.importBatch.findUnique({
        where: { id: input.batchId },
        include: { rows: { orderBy: { lineNumber: 'asc' } } },
      })
      if (!batch) throw new NotFoundException('Lot d’import introuvable.')

      const member = await transaction.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId: batch.organizationId, userId: actorId } },
      })
      if (!member || !['ORG_ADMIN', 'ORG_MANAGER'].includes(member.role)) {
        throw new ForbiddenException('Vous ne pouvez pas appliquer ce lot.')
      }

      if (batch.status === ImportBatchStatus.APPLIED) {
        return this.summary(batch.id, batch.totalRows, batch.createdRows, batch.updatedRows, batch.rows.filter((row) => row.result === ImportRowResult.SKIPPED_DUPLICATE).length, batch.errorRows)
      }
      if (batch.status !== ImportBatchStatus.PREVIEW) {
        throw new ConflictException('Ce lot ne peut plus être appliqué dans son état actuel.')
      }

      let createdRows = 0
      let updatedRows = 0
      let errorRows = 0

      for (const row of batch.rows) {
        const student = this.readStudent(row.raw)
        const validationError = this.validateStudent(student)
        if (row.result === ImportRowResult.ERROR || validationError) {
          errorRows += 1
          await transaction.importRow.update({
            where: { id: row.id },
            data: { result: ImportRowResult.ERROR, errorCode: validationError ?? 'INVALID_ROW' },
          })
          continue
        }

        const email = String(student.email).trim().toLowerCase()
        const existingUser = await transaction.user.findUnique({ where: { email } })
        const user = existingUser
          ? await transaction.user.update({
              where: { id: existingUser.id },
              data: { status: existingUser.status === 'DISABLED' ? 'DISABLED' : existingUser.status },
            })
          : await transaction.user.create({
              data: { email, status: 'INVITED', platformRole: 'TALENT', locale: 'fr' },
            })

        await transaction.talentIdentity.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            firstName: String(student.firstName).trim(),
            lastName: String(student.lastName).trim(),
            gender: this.optionalString(student.gender),
          },
          update: {
            firstName: String(student.firstName).trim(),
            lastName: String(student.lastName).trim(),
            gender: this.optionalString(student.gender),
          },
        })

        await transaction.affiliation.upsert({
          where: { userId_organizationId: { userId: user.id, organizationId: batch.organizationId } },
          create: {
            userId: user.id,
            organizationId: batch.organizationId,
            status: 'ACTIVE',
            cohortYear: Number(student.entryYear),
            changedById: actorId,
          },
          update: {
            status: 'ACTIVE',
            cohortYear: Number(student.entryYear),
            changedById: actorId,
          },
        })

        const lineResult = existingUser ? ImportRowResult.UPDATED : ImportRowResult.CREATED
        await transaction.importRow.update({
          where: { id: row.id },
          data: { normalizedEmail: email, result: lineResult, errorCode: null, userId: user.id },
        })
        if (lineResult === ImportRowResult.CREATED) {
          createdRows += 1
          const rawToken = randomBytes(32).toString('base64url')
          await transaction.invitationToken.create({
            data: {
              userId: user.id,
              importBatchId: batch.id,
              tokenHash: this.hashToken(rawToken),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          })
          invitations.push({ recipient: email, activationToken: rawToken, locale: 'fr' })
        } else {
          updatedRows += 1
        }
      }

      const applied = await transaction.importBatch.update({
        where: { id: batch.id },
        data: {
          status: ImportBatchStatus.APPLIED,
          totalRows: batch.rows.length,
          createdRows,
          updatedRows,
          errorRows,
        },
      })
      const skippedRows = batch.rows.filter((row) => row.result === ImportRowResult.SKIPPED_DUPLICATE).length
      return this.summary(applied.id, applied.totalRows, createdRows, updatedRows, skippedRows, errorRows)
    })

    for (const invitation of invitations) {
      await this.notificationsQueue.enqueue({ kind: 'account.activation', ...invitation })
    }
    return result
  }

  private readStudent(raw: Prisma.JsonValue): ImportStudent {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    return raw as ImportStudent
  }

  private validateStudent(student: ImportStudent): string | null {
    for (const field of REQUIRED_FIELDS) {
      if (student[field] === undefined || student[field] === null || String(student[field]).trim() === '') return `MISSING_${field.toUpperCase()}`
    }
    if (!String(student.email).includes('@')) return 'INVALID_EMAIL'
    if (!Number.isInteger(Number(student.entryYear))) return 'INVALID_ENTRY_YEAR'
    return null
  }

  private optionalString(value: unknown): string | undefined {
    const normalized = value === undefined || value === null ? '' : String(value).trim()
    return normalized || undefined
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  private summary(batchId: string, totalRows: number, createdRows: number, updatedRows: number, skippedRows: number, errorRows: number): ImportApplyResult {
    return { batchId, status: 'APPLIED', totalRows, createdRows, updatedRows, skippedRows, errorRows }
  }
}
