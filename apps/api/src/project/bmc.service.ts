import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { BMC_BLOCK_KEYS, type BmcBlocks, type BmcPatchInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class BmcService {
  constructor(private readonly prisma: PrismaService) {}

  async get(actorId: string, projectId: string) {
    await this.assertMember(actorId, projectId)
    const canvas = await this.prisma.businessModelCanvas.findUnique({ where: { projectId } })
    return this.toResponse(projectId, canvas)
  }

  async patch(actorId: string, projectId: string, input: BmcPatchInput) {
    await this.assertMember(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.businessModelCanvas.findUnique({ where: { projectId } })
      const blocks = this.normalizeBlocks(current?.blocks)
      blocks[input.block] = input.value
      const completedBlocks = BMC_BLOCK_KEYS.filter((key) => blocks[key].content.trim().length > 0).length
      const canvas = await transaction.businessModelCanvas.upsert({
        where: { projectId },
        create: { projectId, blocks: blocks as unknown as Prisma.InputJsonValue, completion: Math.round((completedBlocks / BMC_BLOCK_KEYS.length) * 100), updatedById: actorId },
        update: { blocks: blocks as unknown as Prisma.InputJsonValue, completion: Math.round((completedBlocks / BMC_BLOCK_KEYS.length) * 100), updatedById: actorId },
      })
      return this.toResponse(projectId, canvas)
    })
  }

  private async assertMember(actorId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, members: { where: { userId: actorId, leftAt: null }, select: { id: true, role: true } } },
    })
    if (!project) throw new NotFoundException('Projet introuvable.')
    if (project.members.length === 0) throw new ForbiddenException('Accès au BMC refusé.')
  }

  private normalizeBlocks(value: Prisma.JsonValue | null | undefined): BmcBlocks {
    const candidate = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
    return Object.fromEntries(BMC_BLOCK_KEYS.map((key) => {
      const block = candidate[key]
      if (!block || typeof block !== 'object' || Array.isArray(block)) return [key, { content: '', isPublic: false }]
      const record = block as Record<string, unknown>
      return [key, { content: typeof record.content === 'string' ? record.content : '', isPublic: record.isPublic === true }]
    })) as BmcBlocks
  }

  private toResponse(projectId: string, canvas: { blocks: Prisma.JsonValue; completion: number; updatedAt: Date; updatedById: string | null } | null) {
    const blocks = this.normalizeBlocks(canvas?.blocks)
    const completedBlocks = BMC_BLOCK_KEYS.filter((key) => blocks[key].content.trim().length > 0).length
    return { projectId, blocks, completion: Math.round((completedBlocks / BMC_BLOCK_KEYS.length) * 100), completedBlocks, updatedAt: canvas?.updatedAt ?? null, updatedById: canvas?.updatedById ?? null }
  }
}
