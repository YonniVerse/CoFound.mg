import { BadRequestException, ConflictException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { ReferenceCreateInput, ReferenceKind, ReferencePatchInput } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'

type ReferenceRow = { id: string; slug: string; labelKey: string; category?: string | null; countryCode?: string | null; isActive: boolean; sortOrder: number }
type GenericDelegate = { findMany: (args: { orderBy: Array<Record<string, string | undefined>> }) => Promise<ReferenceRow[]>; create: (args: { data: Record<string, unknown> }) => Promise<ReferenceRow>; update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<ReferenceRow> }

@Injectable()
export class ReferenceDataService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(kind: ReferenceKind) {
    const orderBy = kind === 'regions' ? [{ slug: 'asc' }] : [{ sortOrder: 'asc' }, { slug: 'asc' }]
    const rows = await this.delegate(kind).findMany({ orderBy })
    const items = await Promise.all(rows.map(async (row) => ({ ...row, category: row.category ?? null, countryCode: row.countryCode ?? null, sortOrder: row.sortOrder ?? 0, usageCount: await this.usageCount(kind, row.id) })))
    return { kind, items }
  }

  async listPublicFields() {
    const items = await this.prisma.field.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
      select: { id: true, slug: true, labelKey: true, sortOrder: true },
    })
    return { kind: 'fields', items }
  }

  async listPublicSkills() {
    const items = await this.prisma.skill.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
      select: { id: true, slug: true, labelKey: true, category: true, sortOrder: true },
    })
    return { kind: 'skills', items }
  }

  async listPublicSectors() {
    const items = await this.prisma.sector.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
      select: { id: true, slug: true, labelKey: true, sortOrder: true },
    })
    return { kind: 'sectors', items }
  }

  async listPublicRegions() {
    const items = await this.prisma.region.findMany({
      where: { isActive: true },
      orderBy: [{ slug: 'asc' }],
      select: { id: true, slug: true, labelKey: true },
    })
    return { kind: 'regions', items: items.map((item) => ({ ...item, sortOrder: 0 })) }
  }

  async create(kind: ReferenceKind, input: ReferenceCreateInput) {
    try {
      const created = await this.prisma.$transaction(async (tx) => this.delegate(kind, tx).create({ data: this.data(kind, input) }))
      return { ...created, category: 'category' in created ? created.category : null, countryCode: 'countryCode' in created ? created.countryCode : null, usageCount: 0 }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Ce slug existe déjà.')
      throw error
    }
  }

  async update(kind: ReferenceKind, id: string, input: ReferencePatchInput) {
    if (Object.keys(input).length === 0) throw new BadRequestException('Aucune modification fournie.')
    try {
      const updated = await this.prisma.$transaction(async (tx) => this.delegate(kind, tx).update({ where: { id }, data: this.data(kind, input) }))
      return { ...updated, category: 'category' in updated ? updated.category : null, countryCode: 'countryCode' in updated ? updated.countryCode : null, usageCount: await this.usageCount(kind, id) }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Référentiel introuvable.')
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Ce slug existe déjà.')
      throw error
    }
  }

  private data(kind: ReferenceKind, input: ReferenceCreateInput | ReferencePatchInput) {
    const data: Record<string, unknown> = { ...input }
    if (kind !== 'skills') delete data.category
    if (kind !== 'regions') delete data.countryCode
    if (kind === 'regions') delete data.sortOrder
    return data
  }

  private delegate(kind: ReferenceKind, client: PrismaService | Prisma.TransactionClient = this.prisma) {
    const delegates = { skills: client.skill, fields: client.field, sectors: client.sector, regions: client.region }
    return delegates[kind] as unknown as GenericDelegate
  }

  private async usageCount(kind: ReferenceKind, id: string) {
    if (kind === 'skills') return this.prisma.talentSkill.count({ where: { skillId: id } })
    if (kind === 'fields') return this.prisma.talentProfile.count({ where: { fieldId: id } })
    if (kind === 'sectors') return this.prisma.project.count({ where: { sectorId: id } })
    const [identities, projects] = await Promise.all([this.prisma.talentIdentity.count({ where: { regionId: id } }), this.prisma.project.count({ where: { regionId: id } })])
    return identities + projects
  }
}
