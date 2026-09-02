import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { ImportBatchStatus, ImportRowResult, OrganizationRole } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import { analyzeImportFile, type ImportField } from './import-parser.js'

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

  async updateMapping(batchId: string, actorId: string, columns: Record<string, ImportField | null>) {
    const batch = await this.assertBatchAccess(batchId, actorId)
    if (batch.status !== ImportBatchStatus.PREVIEW) {
      throw new ConflictException('Le mapping ne peut être modifié que pour un lot en prévisualisation.')
    }

    await this.prisma.importBatch.update({
      where: { id: batchId },
      data: { columnMapping: columns as unknown as Prisma.InputJsonValue },
    })

    return { batchId, updated: true }
  }

  async getPreview(batchId: string, actorId: string) {
    const batch = await this.assertBatchAccess(batchId, actorId)
    const rows = await this.prisma.importRow.findMany({
      where: { batchId },
      orderBy: { lineNumber: 'asc' },
    })

    const emails = rows.map((r) => r.normalizedEmail).filter((e): e is string => Boolean(e))
    const existingUsers = await this.prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    })
    const existingEmailSet = new Set(existingUsers.map((u) => u.email.toLowerCase()))

    const seenEmails = new Set<string>()
    const previewRows = rows.map((row) => {
      const raw = (row.raw as Record<string, string>) || {}
      const email = row.normalizedEmail || raw.email || raw.emailAddress || 'email@invalide'
      const firstName = raw.firstName || raw.prénom || raw.prenom || ''
      const lastName = raw.lastName || raw.nom || ''
      const displayName = `${firstName} ${lastName}`.trim() || email

      let result: 'CREATED' | 'UPDATED' | 'SKIPPED_DUPLICATE' | 'ERROR' = 'CREATED'
      let errorMessage: string | null = null

      if (row.result === ImportRowResult.ERROR || row.errorCode) {
        result = 'ERROR'
        errorMessage = row.errorCode || 'Ligne invalide.'
      } else if (seenEmails.has(email.toLowerCase())) {
        result = 'SKIPPED_DUPLICATE'
        errorMessage = 'Adresse email présente plusieurs fois dans le lot.'
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
        result,
        errorMessage,
      }
    })

    return {
      batchId: batch.id,
      fileName: batch.fileKey,
      rows: previewRows,
    }
  }

  private async assertBatchAccess(batchId: string, actorId: string) {
    const batch = await this.prisma.importBatch.findUnique({ where: { id: batchId } })
    if (!batch) throw new NotFoundException('Lot d’import introuvable.')
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: batch.organizationId, userId: actorId } },
    })
    if (!member || !['ORG_ADMIN', 'ORG_MANAGER'].includes(member.role)) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce lot.')
    }
    return batch
  }

  private async resolveOrganizationId(actorId: string, requestedOrgId?: string): Promise<string> {
    const roles = [OrganizationRole.ORG_ADMIN, OrganizationRole.ORG_MANAGER]
    const members = await this.prisma.organizationMember.findMany({
      where: { userId: actorId, role: { in: roles } },
      select: { organizationId: true },
    })

    if (members.length === 0) {
      throw new ForbiddenException('Vous devez être administrateur ou gestionnaire d’un établissement pour importer.')
    }

    if (requestedOrgId) {
      const match = members.find((m) => m.organizationId === requestedOrgId)
      if (!match) {
        throw new ForbiddenException('Vous ne disposez pas des droits d’import sur cet établissement.')
      }
      return requestedOrgId
    }

    return members[0]!.organizationId
  }
}
