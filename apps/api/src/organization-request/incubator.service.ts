import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, Inject } from '@nestjs/common'
import { cohortCreateSchema, incubatorApplicationFilterSchema, programCreateSchema } from '@cofound/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'

const PROGRAM_SELECT = {
  id: true,
  organizationId: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { cohorts: true, opportunities: true } },
} as const

const COHORT_SELECT = {
  id: true,
  programId: true,
  name: true,
  region: true,
  startsAt: true,
  endsAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { opportunities: true } },
} as const

@Injectable()
export class IncubatorService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(AuditService) private readonly audit: AuditService) {}

  async listPrograms(actorId: string, organizationId: string) {
    await this.assertIncubatorReader(actorId, organizationId)
    return this.prisma.program.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' }, select: PROGRAM_SELECT })
      .then((items) => items.map((item) => ({ ...item, cohortsCount: item._count.cohorts, opportunitiesCount: item._count.opportunities, _count: undefined })))
  }

  async createProgram(actorId: string, organizationId: string, input: unknown) {
    await this.assertIncubatorManager(actorId, organizationId)
    const parsed = programCreateSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const organization = await this.prisma.organization.findUnique({ where: { id: organizationId }, select: { type: true, programsLimit: true, _count: { select: { programs: true } } } })
    if (!organization || organization.type !== 'INCUBATOR') throw new ForbiddenException({ code: 'INCUBATOR_ORGANIZATION_REQUIRED', messageKey: 'errors.forbidden' })
    if (organization.programsLimit > 0 && organization._count.programs >= organization.programsLimit) throw new ConflictException({ code: 'PROGRAM_LIMIT_REACHED', messageKey: 'errors.planLimitReached' })
    try {
      const program = await this.prisma.program.create({ data: { organizationId, name: parsed.data.name, description: parsed.data.description || null }, select: PROGRAM_SELECT })
      await this.audit.record({ actorId, action: 'INCUBATOR_PROGRAM_CREATED', targetType: 'Program', targetId: program.id, metadata: { organizationId } })
      return { ...program, cohortsCount: program._count.cohorts, opportunitiesCount: program._count.opportunities, _count: undefined }
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') throw new ConflictException({ code: 'PROGRAM_NAME_EXISTS', messageKey: 'errors.alreadyProcessed' })
      throw error
    }
  }

  async activateProgram(actorId: string, organizationId: string, programId: string) {
    await this.assertIncubatorManager(actorId, organizationId)
    const current = await this.prisma.program.findFirst({ where: { id: programId, organizationId }, select: { id: true, status: true } })
    if (!current) throw new NotFoundException({ code: 'PROGRAM_NOT_FOUND', messageKey: 'errors.notFound' })
    if (current.status === 'ARCHIVED') throw new ConflictException({ code: 'PROGRAM_ARCHIVED', messageKey: 'errors.alreadyProcessed' })
    const program = await this.prisma.program.update({ where: { id: programId }, data: { status: 'ACTIVE' }, select: PROGRAM_SELECT })
    await this.audit.record({ actorId, action: 'INCUBATOR_PROGRAM_ACTIVATED', targetType: 'Program', targetId: programId, metadata: { organizationId } })
    return { ...program, cohortsCount: program._count.cohorts, opportunitiesCount: program._count.opportunities, _count: undefined }
  }

  async listCohorts(actorId: string, organizationId: string, programId: string) {
    await this.assertIncubatorReader(actorId, organizationId)
    await this.assertProgram(organizationId, programId)
    return this.prisma.cohort.findMany({ where: { programId }, orderBy: { createdAt: 'desc' }, select: COHORT_SELECT })
      .then((items) => items.map((item) => ({ ...item, opportunitiesCount: item._count.opportunities, _count: undefined })))
  }

  async createCohort(actorId: string, organizationId: string, programId: string, input: unknown) {
    await this.assertIncubatorManager(actorId, organizationId)
    const parsed = cohortCreateSchema.safeParse(input)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const program = await this.prisma.program.findFirst({ where: { id: programId, organizationId }, select: { id: true, status: true, organization: { select: { cohortsLimit: true, _count: { select: { programs: true } } } } } })
    if (!program) throw new NotFoundException({ code: 'PROGRAM_NOT_FOUND', messageKey: 'errors.notFound' })
    if (program.status === 'ARCHIVED') throw new ConflictException({ code: 'PROGRAM_ARCHIVED', messageKey: 'errors.alreadyProcessed' })
    const totalCohorts = await this.prisma.cohort.count({ where: { program: { organizationId } } })
    if (program.organization.cohortsLimit > 0 && totalCohorts >= program.organization.cohortsLimit) throw new ConflictException({ code: 'COHORT_LIMIT_REACHED', messageKey: 'errors.planLimitReached' })
    try {
      const cohort = await this.prisma.cohort.create({ data: { programId, name: parsed.data.name, region: parsed.data.region || null, startsAt: parsed.data.startsAt ?? null, endsAt: parsed.data.endsAt ?? null }, select: COHORT_SELECT })
      await this.audit.record({ actorId, action: 'INCUBATOR_COHORT_CREATED', targetType: 'Cohort', targetId: cohort.id, metadata: { organizationId, programId } })
      return { ...cohort, opportunitiesCount: cohort._count.opportunities, _count: undefined }
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') throw new ConflictException({ code: 'COHORT_NAME_EXISTS', messageKey: 'errors.alreadyProcessed' })
      throw error
    }
  }

  async openCohort(actorId: string, organizationId: string, cohortId: string) {
    await this.assertIncubatorManager(actorId, organizationId)
    const current = await this.prisma.cohort.findFirst({ where: { id: cohortId, program: { organizationId } }, select: { id: true, status: true } })
    if (!current) throw new NotFoundException({ code: 'COHORT_NOT_FOUND', messageKey: 'errors.notFound' })
    if (current.status === 'ARCHIVED') throw new ConflictException({ code: 'COHORT_ARCHIVED', messageKey: 'errors.alreadyProcessed' })
    return this.prisma.cohort.update({ where: { id: cohortId }, data: { status: 'OPEN' }, select: COHORT_SELECT })
  }

  async listApplications(actorId: string, organizationId: string, input: unknown) {
    await this.assertIncubatorReader(actorId, organizationId)
    const parsed = incubatorApplicationFilterSchema.safeParse(input ?? {})
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', issues: parsed.error.issues })
    const applications = await this.prisma.opportunityApplication.findMany({
      where: { opportunity: { organizationId, ...(parsed.data.programId ? { programId: parsed.data.programId } : {}), ...(parsed.data.cohortId ? { cohortId: parsed.data.cohortId } : {}) }, ...(parsed.data.status ? { status: parsed.data.status } : {}) },
      orderBy: { createdAt: 'asc' },
      select: { id: true, opportunityId: true, applicantType: true, applicantId: true, message: true, status: true, rejectionReason: true, createdAt: true, opportunity: { select: { id: true, title: true, program: { select: { id: true, name: true } }, cohort: { select: { id: true, name: true, region: true } } } } },
    })
    return applications
  }

  private async assertProgram(organizationId: string, programId: string) {
    const program = await this.prisma.program.findFirst({ where: { id: programId, organizationId }, select: { id: true } })
    if (!program) throw new NotFoundException({ code: 'PROGRAM_NOT_FOUND', messageKey: 'errors.notFound' })
    return program
  }

  private async assertIncubatorReader(actorId: string, organizationId: string) {
    const membership = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: actorId } }, select: { role: true, user: { select: { status: true } }, organization: { select: { type: true } } } })
    if (!membership || membership.user.status !== 'ACTIVE' || membership.organization.type !== 'INCUBATOR' || !['ORG_ADMIN', 'ORG_MANAGER', 'ORG_VIEWER'].includes(membership.role)) throw new ForbiddenException({ code: 'INCUBATOR_ACCESS_REQUIRED', messageKey: 'errors.forbidden' })
  }

  private async assertIncubatorManager(actorId: string, organizationId: string) {
    const membership = await this.prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId, userId: actorId } }, select: { role: true, user: { select: { status: true } }, organization: { select: { type: true } } } })
    if (!membership || membership.user.status !== 'ACTIVE' || membership.organization.type !== 'INCUBATOR' || !['ORG_ADMIN', 'ORG_MANAGER'].includes(membership.role)) throw new ForbiddenException({ code: 'INCUBATOR_MANAGE_REQUIRED', messageKey: 'errors.forbidden' })
  }
}
