import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { OpenPositionCreateInput, OpenPositionPatchInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

type PositionWithSkills = { id: string; projectId: string; title: string; description: string | null; expectedHours: number | null; isOpen: boolean; skills: Array<{ skill: { id: string; labelKey: string } }> }

@Injectable()
export class PositionService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(actorId: string, projectId: string) {
    await this.assertMember(actorId, projectId)
    const positions = await this.prisma.openPosition.findMany({ where: { projectId }, orderBy: { id: 'asc' }, include: { skills: { include: { skill: { select: { id: true, labelKey: true } } } } } })
    return { projectId, positions: positions.map((position) => this.present(position as unknown as PositionWithSkills)) }
  }

  async create(actorId: string, projectId: string, input: OpenPositionCreateInput) {
    await this.assertOwner(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      await this.assertSkills(transaction, input.skillIds)
      const position = await transaction.openPosition.create({ data: { projectId, title: input.title, description: input.description ?? null, expectedHours: input.expectedHours ?? null, skills: { create: input.skillIds.map((skillId) => ({ skillId })) } }, include: { skills: { include: { skill: { select: { id: true, labelKey: true } } } } } })
      return this.present(position as unknown as PositionWithSkills)
    })
  }

  async update(actorId: string, projectId: string, positionId: string, input: OpenPositionPatchInput) {
    await this.assertOwner(actorId, projectId)
    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.openPosition.findFirst({ where: { id: positionId, projectId }, select: { id: true } })
      if (!current) throw new NotFoundException('Poste introuvable.')
      if (input.skillIds) await this.assertSkills(transaction, input.skillIds)
      const position = await transaction.openPosition.update({ where: { id: positionId }, data: { title: input.title, description: input.description, expectedHours: input.expectedHours, isOpen: input.isOpen, skills: input.skillIds ? { deleteMany: {}, create: input.skillIds.map((skillId) => ({ skillId })) } : undefined }, include: { skills: { include: { skill: { select: { id: true, labelKey: true } } } } } })
      return this.present(position as unknown as PositionWithSkills)
    })
  }

  private async assertMember(actorId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true, members: { where: { userId: actorId, leftAt: null }, select: { id: true } } } })
    if (!project) throw new NotFoundException('Projet introuvable.')
    if (project.members.length === 0) throw new ForbiddenException('Accès au projet refusé.')
  }

  private async assertOwner(actorId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true, members: { where: { userId: actorId, leftAt: null, role: 'OWNER' }, select: { id: true } } } })
    if (!project) throw new NotFoundException('Projet introuvable.')
    if (project.members.length === 0) throw new ForbiddenException('Seul le propriétaire peut gérer les postes.')
  }

  private async assertSkills(transaction: Prisma.TransactionClient, skillIds: string[]) {
    const skills = await transaction.skill.findMany({ where: { id: { in: skillIds }, isActive: true }, select: { id: true } })
    if (skills.length !== skillIds.length) throw new BadRequestException('Une compétence est inexistante ou inactive.')
  }

  private present(position: PositionWithSkills) {
    return { id: position.id, projectId: position.projectId, title: position.title, description: position.description, expectedHours: position.expectedHours, isOpen: position.isOpen, skills: position.skills.map(({ skill }) => ({ id: skill.id, name: skill.labelKey })) }
  }
}
