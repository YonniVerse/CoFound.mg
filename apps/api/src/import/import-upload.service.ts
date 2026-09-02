import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { ImportBatchStatus, ImportRowResult, OrganizationType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import { analyzeImportFile, cleanText, extractStudentFromRow, IMPORT_FIELDS, type ImportField } from './import-parser.js'

@Injectable()
export class ImportUploadService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async upload(file: Express.Multer.File | undefined, actorId: string, targetOrganizationId?: string) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Un fichier CSV ou XLSX est requis.')
    }

    const orgId = await this.resolveOrganizationId(actorId, targetOrganizationId)
    const analysis = analyzeImportFile(file.buffer, file.originalname)

    const batch = await this.prisma.$transaction(async (tx) => {
      const createdBatch = await tx.importBatch.create({
        data: {
          organizationId: orgId,
          uploadedById: actorId,
          fileKey: file.originalname,
          status: ImportBatchStatus.PREVIEW,
          columnMapping: analysis.columnMapping as unknown as Prisma.InputJsonValue,
          totalRows: analysis.rows.length,
          createdRows: 0,
          updatedRows: 0,
          errorRows: analysis.rows.filter((r) => r.errors.length > 0).length,
        },
      })

      if (analysis.rows.length > 0) {
        await tx.importRow.createMany({
          data: analysis.rows.map((row) => ({
            batchId: createdBatch.id,
            lineNumber: row.lineNumber,
            raw: row.raw,
            normalizedEmail: row.normalized.email || null,
            result: row.errors.length > 0 ? ImportRowResult.ERROR : null,
            errorCode: row.errors.length > 0 ? row.errors.join('; ') : null,
          })),
        })
      }

      return createdBatch
    })

    return {
      batchId: batch.id,
      fileName: batch.fileKey,
      status: batch.status,
      totalRows: batch.totalRows,
      errorRows: batch.errorRows,
      headers: analysis.headers,
      columnMapping: analysis.columnMapping,
      unknownColumns: analysis.unknownColumns,
      missingRequiredFields: analysis.missingRequiredFields,
      warnings: analysis.warnings,
    }
  }

  async getMapping(batchId: string, actorId: string) {
    const batch = await this.assertBatchAccess(batchId, actorId)
    const rows = await this.prisma.importRow.findMany({
      where: { batchId },
      orderBy: { lineNumber: 'asc' },
      take: 20,
    })

    const allHeadersSet = new Set<string>()
    for (const row of rows) {
      const raw = (row.raw as Record<string, string>) || {}
      Object.keys(raw).forEach((h) => allHeadersSet.add(h))
    }
    const headers = Array.from(allHeadersSet)

    const currentMapping = (batch.columnMapping as Record<string, unknown> | null) || {}

    const detectedColumns = headers.map((header) => {
      const samples: string[] = []
      for (const row of rows) {
        const raw = (row.raw as Record<string, string>) || {}
        const val = cleanText(raw[header])
        if (val && !samples.includes(val) && samples.length < 3) {
          samples.push(val)
        }
      }

      let suggestedField: ImportField | null = null
      if (typeof currentMapping[header] === 'string' && IMPORT_FIELDS.includes(currentMapping[header] as ImportField)) {
        suggestedField = currentMapping[header] as ImportField
      } else {
        for (const [field, mappedHeader] of Object.entries(currentMapping)) {
          if (mappedHeader === header && IMPORT_FIELDS.includes(field as ImportField)) {
            suggestedField = field as ImportField
            break
          }
        }
      }

      return {
        name: header,
        suggestedField,
        samples,
      }
    })

    // Compute normalized mapping format { headerName: fieldOrNull }
    const normalizedColumnMapping: Record<string, ImportField | null> = {}
    for (const col of detectedColumns) {
      normalizedColumnMapping[col.name] = col.suggestedField
    }

    return {
      batchId: batch.id,
      fileName: batch.fileKey,
      status: batch.status,
      totalRows: batch.totalRows,
      errorRows: batch.errorRows,
      headers,
      columnMapping: normalizedColumnMapping,
      detectedColumns,
    }
  }

  async updateMapping(batchId: string, actorId: string, columns: Record<string, ImportField | null>) {
    const batch = await this.assertBatchAccess(batchId, actorId)
    if (batch.status !== ImportBatchStatus.PREVIEW) {
      throw new ConflictException('Le mapping ne peut être modifié que pour un lot en prévisualisation.')
    }

    const rows = await this.prisma.importRow.findMany({
      where: { batchId },
    })

    let errorCount = 0

    await this.prisma.$transaction(async (tx) => {
      for (const row of rows) {
        const raw = (row.raw as Record<string, unknown>) || {}
        const { student, errors } = extractStudentFromRow(raw, columns)
        const isError = errors.length > 0
        if (isError) errorCount++

        await tx.importRow.update({
          where: { id: row.id },
          data: {
            normalizedEmail: student.email || null,
            result: isError ? ImportRowResult.ERROR : null,
            errorCode: isError ? errors.join('; ') : null,
          },
        })
      }

      await tx.importBatch.update({
        where: { id: batchId },
        data: {
          columnMapping: columns as unknown as Prisma.InputJsonValue,
          errorRows: errorCount,
        },
      })
    })

    return { batchId, updated: true, totalRows: rows.length, errorRows: errorCount }
  }

  async getPreview(batchId: string, actorId: string) {
    const batch = await this.assertBatchAccess(batchId, actorId)
    const rows = await this.prisma.importRow.findMany({
      where: { batchId },
      orderBy: { lineNumber: 'asc' },
    })

    const mapping = batch.columnMapping as Record<string, unknown> | null

    const rowEvaluations = rows.map((row) => {
      const raw = (row.raw as Record<string, unknown>) || {}
      const { student, errors } = extractStudentFromRow(raw, mapping)
      return { row, student, errors }
    })

    const emails = rowEvaluations
      .map((item) => item.student.email)
      .filter((e): e is string => Boolean(e && e.includes('@')))

    const existingUsers = await this.prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    })
    const existingEmailSet = new Set(existingUsers.map((u) => u.email.toLowerCase()))

    const seenEmails = new Set<string>()
    const previewRows = rowEvaluations.map(({ row, student, errors }) => {
      const email = student.email || row.normalizedEmail || 'email@invalide'
      const firstName = student.firstName || ''
      const lastName = student.lastName || ''
      const displayName = `${firstName} ${lastName}`.trim() || email
      const fieldOfStudy = student.fieldOfStudy || ''
      const level = student.level || ''
      const entryYear = student.entryYear ?? null

      let result: 'CREATED' | 'UPDATED' | 'SKIPPED_DUPLICATE' | 'ERROR' = 'CREATED'
      let errorMessage: string | null = null

      if (errors.length > 0 || row.result === ImportRowResult.ERROR) {
        result = 'ERROR'
        errorMessage = errors.length > 0 ? errors.join('; ') : (row.errorCode || 'Ligne invalide.')
      } else if (seenEmails.has(email.toLowerCase())) {
        result = 'SKIPPED_DUPLICATE'
        errorMessage = 'Adresse email présente plusieurs fois dans le fichier.'
      } else {
        seenEmails.add(email.toLowerCase())
        if (existingEmailSet.has(email.toLowerCase())) {
          result = 'UPDATED'
        }
      }

      return {
        lineNumber: row.lineNumber,
        displayName,
        email,
        fieldOfStudy,
        level,
        entryYear,
        result,
        errorMessage,
      }
    })

    return {
      batchId: batch.id,
      fileName: batch.fileKey,
      status: batch.status,
      counters: {
        totalRows: previewRows.length,
        createdRows: previewRows.filter((r) => r.result === 'CREATED').length,
        updatedRows: previewRows.filter((r) => r.result === 'UPDATED').length,
        skippedRows: previewRows.filter((r) => r.result === 'SKIPPED_DUPLICATE').length,
        errorRows: previewRows.filter((r) => r.result === 'ERROR').length,
      },
      rows: previewRows,
    }
  }

  private async assertBatchAccess(batchId: string, actorId: string) {
    const batch = await this.prisma.importBatch.findUnique({ where: { id: batchId } })
    if (!batch) throw new NotFoundException('Lot d’import introuvable.')

    const user = this.prisma.user
      ? await this.prisma.user.findUnique({ where: { id: actorId }, select: { platformRole: true } })
      : null
    if (user?.platformRole === 'STAFF') return batch

    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: batch.organizationId, userId: actorId } },
    })
    if (!member) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce lot.')
    }
    return batch
  }

  private async resolveOrganizationId(actorId: string, targetOrganizationId?: string): Promise<string> {
    const user = this.prisma.user
      ? await this.prisma.user.findUnique({ where: { id: actorId }, select: { platformRole: true } })
      : null

    const members = await this.prisma.organizationMember.findMany({
      where: { userId: actorId },
      select: { organizationId: true, role: true },
    })

    if (targetOrganizationId) {
      if (user?.platformRole === 'STAFF') return targetOrganizationId
      const match = members.find((m) => m.organizationId === targetOrganizationId)
      if (!match) {
        throw new ForbiddenException('Vous ne disposez pas des droits d’import sur cet établissement.')
      }
      return targetOrganizationId
    }

    if (members.length > 0) {
      const managerMember = members.find((m) => ['ORG_ADMIN', 'ORG_MANAGER'].includes(m.role))
      return (managerMember || members[0])!.organizationId
    }

    if (user?.platformRole === 'STAFF') {
      const org = await this.prisma.organization.findFirst({
        where: { type: OrganizationType.INSTITUTION },
        select: { id: true },
      }) || await this.prisma.organization.findFirst({ select: { id: true } })
      if (org) return org.id
    }

    const firstOrg = await this.prisma.organization.findFirst({ select: { id: true } })
    if (firstOrg) return firstOrg.id

    throw new ForbiddenException('Vous devez être rattaché à un établissement pour effectuer un import.')
  }
}
