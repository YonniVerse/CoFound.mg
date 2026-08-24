import { ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PersonalDataExportStatus } from '@prisma/client'
import type { PersonalDataExportRequest } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'
import { PersonalDataExportQueueService } from './personal-data-export-queue.service.js'

const ACTIVE_STATUSES: PersonalDataExportStatus[] = [PersonalDataExportStatus.PENDING, PersonalDataExportStatus.PROCESSING, PersonalDataExportStatus.READY]

@Injectable()
export class PersonalDataExportService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService, private readonly queue: PersonalDataExportQueueService) {}

  async request(userId: string, input: PersonalDataExportRequest) {
    if (!input.confirmation) throw new ConflictException('La confirmation explicite est requise.')
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.personalDataExport.findFirst({ where: { userId, status: { in: ACTIVE_STATUSES } }, orderBy: { requestedAt: 'desc' } })
      if (existing) return existing
      return tx.personalDataExport.create({ data: { userId, status: PersonalDataExportStatus.PENDING } })
    })
    if (result.status === PersonalDataExportStatus.PENDING) await this.queue.enqueue({ exportId: result.id, userId })
    await this.audit.record({ actorId: userId, action: 'PERSONAL_DATA_EXPORT_REQUESTED', targetType: 'PersonalDataExport', targetId: result.id, metadata: { requested: true } })
    return { export: this.present(result) }
  }

  async download(userId: string, exportId: string) {
    const result = await this.prisma.personalDataExport.findFirst({ where: { id: exportId, userId } })
    if (!result) throw new NotFoundException('Export introuvable.')
    if (result.status !== PersonalDataExportStatus.READY || !result.storageKey) throw new NotFoundException('Export non disponible.')
    if (result.expiresAt && result.expiresAt <= new Date()) {
      await this.prisma.personalDataExport.update({ where: { id: result.id }, data: { status: PersonalDataExportStatus.EXPIRED } })
      throw new GoneException('Export expiré.')
    }
    const directory = process.env.PERSONAL_EXPORT_DIR ?? '/tmp/cofound-personal-exports'
    return { body: await readFile(join(directory, result.storageKey)), filename: `cofound-export-${result.id}.json` }
  }

  async status(userId: string, exportId: string) {
    const result = await this.prisma.personalDataExport.findFirst({ where: { id: exportId, userId } })
    if (!result) throw new NotFoundException('Export introuvable.')
    return { export: this.present(result) }
  }

  private present(item: { id: string; status: PersonalDataExportStatus; requestedAt: Date; completedAt: Date | null; expiresAt: Date | null; storageKey: string | null }) {
    const available = item.status === PersonalDataExportStatus.READY && Boolean(item.storageKey) && (!item.expiresAt || item.expiresAt > new Date())
    return { id: item.id, status: item.status, requestedAt: item.requestedAt, completedAt: item.completedAt, expiresAt: item.expiresAt, downloadAvailable: available }
  }
}
