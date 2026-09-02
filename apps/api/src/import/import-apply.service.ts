import { ConflictException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { createHash, randomBytes } from 'node:crypto'
import * as argon2 from 'argon2'
import { ImportBatchStatus, ImportRowResult } from '@prisma/client'
import { INVITATION_EXPIRY_DAYS, type ImportApplyInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { NotificationsQueueService } from '../notifications/notifications-queue.service.js'
import { extractStudentFromRow } from './import-parser.js'

type PendingInvitation = {
  recipient: string
  activationToken: string
  temporaryPassword: string
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
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationsQueueService) private readonly notificationsQueue: NotificationsQueueService,
  ) {}

  async apply(input: ImportApplyInput, actorId: string): Promise<ImportApplyResult> {
    const invitations: PendingInvitation[] = []

    const result = await this.prisma.$transaction(
      async (transaction) => {
        const batch = await transaction.importBatch.findUnique({
          where: { id: input.batchId },
          include: {
            rows: { orderBy: { lineNumber: 'asc' } },
            organization: true,
          },
        })
        if (!batch) throw new NotFoundException('Lot d’import introuvable.')

        const actor = transaction.user
          ? await transaction.user.findUnique({
              where: { id: actorId },
              select: { platformRole: true },
            })
          : null
        const isStaff = actor?.platformRole === 'STAFF'

        const member = await transaction.organizationMember.findUnique({
          where: { organizationId_userId: { organizationId: batch.organizationId, userId: actorId } },
        })
        if (!isStaff && (!member || !['ORG_ADMIN', 'ORG_MANAGER'].includes(member.role))) {
          throw new ForbiddenException('Vous ne pouvez pas appliquer ce lot.')
        }

        if (batch.status === ImportBatchStatus.APPLIED) {
          return this.summary(
            batch.id,
            batch.totalRows,
            batch.createdRows,
            batch.updatedRows,
            batch.rows.filter((row) => row.result === ImportRowResult.SKIPPED_DUPLICATE).length,
            batch.errorRows,
          )
        }
        if (batch.status !== ImportBatchStatus.PREVIEW) {
          throw new ConflictException('Ce lot ne peut plus être appliqué dans son état actuel.')
        }

        // Pre-fetch active fields to match fieldOfStudy
        const activeFields = transaction.field ? await transaction.field.findMany({ where: { isActive: true } }) : []
        const fieldMap = new Map<string, string>()
        const synonymMap: Record<string, string> = {
          informatique: 'computer-science',
          info: 'computer-science',
          'génie informatique': 'computer-science',
          gestion: 'management',
          commerce: 'management',
          management: 'management',
          droit: 'law',
          juridique: 'law',
          économie: 'economics',
          economie: 'economics',
          finance: 'economics',
          'génie civil': 'engineering',
          ingénierie: 'engineering',
          ingenierie: 'engineering',
          agriculture: 'agriculture',
          agronomie: 'agriculture',
          communication: 'communication',
          design: 'design',
        }
        for (const field of activeFields) {
          fieldMap.set(field.slug.toLowerCase(), field.id)
          fieldMap.set(field.labelKey.toLowerCase(), field.id)
        }
        for (const [syn, slug] of Object.entries(synonymMap)) {
          const id = fieldMap.get(slug)
          if (id) fieldMap.set(syn, id)
        }

        const isCertifying = batch.organization?.type === 'INSTITUTION'

        let createdRows = 0
        let updatedRows = 0
        let errorRows = 0
        const seenEmailsInBatch = new Set<string>()

        for (const row of batch.rows) {
          const raw = (row.raw as Record<string, unknown>) || {}
          const { student, errors } = extractStudentFromRow(raw, batch.columnMapping)

          if (row.result === ImportRowResult.ERROR || errors.length > 0) {
            errorRows += 1
            await transaction.importRow.update({
              where: { id: row.id },
              data: {
                result: ImportRowResult.ERROR,
                errorCode: errors.length > 0 ? errors.join('; ') : (row.errorCode ?? 'INVALID_ROW'),
              },
            })
            continue
          }

          const email = String(student.email).trim().toLowerCase()

          if (seenEmailsInBatch.has(email)) {
            await transaction.importRow.update({
              where: { id: row.id },
              data: {
                normalizedEmail: email,
                result: ImportRowResult.SKIPPED_DUPLICATE,
                errorCode: 'Adresse email présente plusieurs fois dans le lot.',
              },
            })
            continue
          }
          seenEmailsInBatch.add(email)

          let matchedFieldId: string | undefined = undefined
          if (student.fieldOfStudy) {
            const normField = String(student.fieldOfStudy).toLowerCase().trim()
            matchedFieldId = fieldMap.get(normField)
            if (!matchedFieldId) {
              for (const [key, id] of fieldMap.entries()) {
                if (normField.includes(key) || key.includes(normField)) {
                  matchedFieldId = id
                  break
                }
              }
            }
          }

          const existingUser = await transaction.user.findUnique({ where: { email } })
          const tempPassword = this.generateTemporaryPassword()
          const rawToken = randomBytes(32).toString('base64url')
          const passwordHash = await argon2.hash(tempPassword, { type: argon2.argon2id })

          const user = existingUser
            ? await transaction.user.update({
                where: { id: existingUser.id },
                data: { status: existingUser.status === 'DISABLED' ? 'DISABLED' : existingUser.status },
              })
            : await transaction.user.create({
                data: {
                  email,
                  passwordHash,
                  status: 'INVITED',
                  platformRole: 'TALENT',
                  locale: 'fr',
                },
              })

        const firstName = this.optionalString(student.firstName) || ''
        const lastName = this.optionalString(student.lastName) || ''
        const dateOfBirth = student.dateOfBirth ? new Date(student.dateOfBirth) : undefined

        await transaction.talentIdentity.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            firstName,
            lastName,
            gender: this.optionalString(student.gender),
            dateOfBirth: dateOfBirth && !isNaN(dateOfBirth.getTime()) ? dateOfBirth : undefined,
          },
          update: {
            firstName,
            lastName,
            gender: this.optionalString(student.gender),
            ...(dateOfBirth && !isNaN(dateOfBirth.getTime()) ? { dateOfBirth } : {}),
          },
        })

        await transaction.affiliation.upsert({
          where: { userId_organizationId: { userId: user.id, organizationId: batch.organizationId } },
          create: {
            userId: user.id,
            organizationId: batch.organizationId,
            status: 'ACTIVE',
            isCertifying,
            cohortYear: Number(student.entryYear) || undefined,
            fieldId: matchedFieldId,
            changedById: actorId,
          },
          update: {
            status: 'ACTIVE',
            isCertifying,
            cohortYear: Number(student.entryYear) || undefined,
            fieldId: matchedFieldId,
            changedById: actorId,
          },
        })

        await transaction.talentProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            pseudonym: `talent-${user.id.slice(0, 8)}`,
            avatarSeed: `cofound-${user.id.slice(0, 12)}`,
            level: this.optionalString(student.level),
            cohortYear: Number(student.entryYear) || undefined,
            fieldId: matchedFieldId,
            onboardingStep: 1,
          },
          update: {
            level: this.optionalString(student.level),
            cohortYear: Number(student.entryYear) || undefined,
            fieldId: matchedFieldId,
          },
        })

        const lineResult = existingUser ? ImportRowResult.UPDATED : ImportRowResult.CREATED
        await transaction.importRow.update({
          where: { id: row.id },
          data: { normalizedEmail: email, result: lineResult, errorCode: null, userId: user.id },
        })

        if (lineResult === ImportRowResult.CREATED) {
          createdRows += 1
          await transaction.invitationToken.create({
            data: {
              userId: user.id,
              importBatchId: batch.id,
              tokenHash: this.hashToken(rawToken),
              expiresAt: new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            },
          })
          invitations.push({
            recipient: email,
            activationToken: rawToken,
            temporaryPassword: tempPassword,
            locale: 'fr',
          })
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
      const skippedRows = batch.rows.length - createdRows - updatedRows - errorRows
      return this.summary(applied.id, applied.totalRows, createdRows, updatedRows, Math.max(0, skippedRows), errorRows)
    },
    {
      maxWait: 10000,
      timeout: 60000,
    })

    for (const invitation of invitations) {
      await this.notificationsQueue.enqueue({
        kind: 'account.credentials',
        recipient: invitation.recipient,
        temporaryPassword: invitation.temporaryPassword,
        activationToken: invitation.activationToken,
        locale: invitation.locale,
      })
    }
    return result
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#'
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  private optionalString(value: unknown): string | undefined {
    const normalized = value === undefined || value === null ? '' : String(value).trim()
    return normalized || undefined
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  private summary(
    batchId: string,
    totalRows: number,
    createdRows: number,
    updatedRows: number,
    skippedRows: number,
    errorRows: number,
  ): ImportApplyResult {
    return { batchId, status: 'APPLIED', totalRows, createdRows, updatedRows, skippedRows, errorRows }
  }
}
