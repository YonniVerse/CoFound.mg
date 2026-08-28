import { Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Optional, Inject } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { NotificationService } from '../notifications/notification.service.js'
import {
  ApplicationStatus,
  ProjectStatus,
  type CreateApplicationInput,
  type ApplicationItem,
  type MyApplicationHistoryItem,
  type MyApplicationsResponse,
  type OwnerApplicationItem,
  type OwnerApplicationsResponse,
  type RejectApplicationInput,
} from '@cofound/shared'

@Injectable()
export class ApplicationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Optional() @Inject(NotificationService) private readonly notifications?: NotificationService) {}

  async create(
    applicantId: string,
    input: CreateApplicationInput,
  ): Promise<ApplicationItem> {
    // 1. Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: input.projectId },
    })

    if (!project) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        messageKey: 'errors.projectNotFound',
      })
    }

    if (project.status !== ProjectStatus.RECRUITING) {
      throw new BadRequestException({ code: 'PROJECT_CLOSED', messageKey: 'errors.projectClosed' })
    }

    const applicant = this.prisma.user ? await this.prisma.user.findUnique({ where: { id: applicantId }, select: { status: true } }) : { status: 'ACTIVE' as const }
    if (!applicant || applicant.status === 'ALUMNI' || applicant.status === 'DISABLED' || applicant.status === 'FROZEN') {
      throw new BadRequestException({ code: 'NOT_ELIGIBLE', messageKey: 'errors.notEligible' })
    }

    // 2. If positionId is supplied, verify open position exists and is open
    if (input.positionId) {
      const position = await this.prisma.openPosition.findUnique({
        where: { id: input.positionId },
      })

      if (!position || position.projectId !== input.projectId) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          messageKey: 'errors.positionNotFound',
        })
      }

      if (!position.isOpen) {
        throw new BadRequestException({
          code: 'POSITION_CLOSED',
          messageKey: 'errors.positionClosed',
        })
      }
    }

    // 3. Check for existing pending application for this project + applicant
    const existingPending = await this.prisma.application.findFirst({
      where: {
        projectId: input.projectId,
        applicantId,
        status: ApplicationStatus.PENDING,
      },
    })

    if (existingPending) {
      throw new ConflictException({
        code: 'APPLICATION_ALREADY_EXISTS',
        messageKey: 'errors.applicationAlreadyExists',
      })
    }

    // 4. Create application
    const application = await this.prisma.application.create({
      data: {
        projectId: input.projectId,
        positionId: input.positionId ?? null,
        applicantId,
        message: input.message,
        status: ApplicationStatus.PENDING,
      },
      include: {
        project: true,
        position: true,
      },
    })

    return {
      id: application.id,
      projectId: application.projectId,
      positionId: application.positionId,
      applicantId: application.applicantId,
      message: application.message,
      status: application.status as ApplicationStatus,
      rejectionReason: application.rejectionReason,
      decidedAt: application.decidedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      project: {
        id: application.project.id,
        title: application.project.title,
        pitch: application.project.pitch,
        status: application.project.status as ProjectStatus,
      },
      position: application.position
        ? {
            id: application.position.id,
            title: application.position.title,
            description: application.position.description,
          }
        : null,
    }
  }

  async getMyApplications(
    applicantId: string,
  ): Promise<MyApplicationsResponse> {
    const [applications, opportunityApplications] = await Promise.all([
      this.prisma.application.findMany({
        where: { applicantId },
        include: { project: true, position: true },
      }),
      this.prisma.opportunityApplication
        ? this.prisma.opportunityApplication.findMany({
            where: { applicantType: 'TALENT', applicantId },
            include: {
              opportunity: {
                select: {
                  id: true,
                  organizationId: true,
                  title: true,
                  description: true,
                  deadline: true,
                  seats: true,
                  status: true,
                },
              },
            },
          })
        : Promise.resolve([]),
    ])

    const projectItems: MyApplicationHistoryItem[] = applications.map((app) => ({
      source: 'PROJECT' as const,
      id: app.id,
      projectId: app.projectId,
      positionId: app.positionId,
      applicantId: app.applicantId,
      message: app.message,
      status: app.status as ApplicationStatus,
      rejectionReason: app.rejectionReason,
      decidedAt: app.decidedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      project: {
        id: app.project.id,
        title: app.project.title,
        pitch: app.project.pitch,
        status: app.project.status as ProjectStatus,
      },
      position: app.position
        ? { id: app.position.id, title: app.position.title, description: app.position.description }
        : null,
      opportunity: null,
    }))

    const opportunityItems: MyApplicationHistoryItem[] = opportunityApplications.map((app) => ({
      source: 'OPPORTUNITY' as const,
      id: app.id,
      opportunityId: app.opportunityId,
      applicantId: app.applicantId,
      message: app.message,
      status: app.status as ApplicationStatus,
      rejectionReason: app.rejectionReason,
      createdAt: app.createdAt,
      project: null,
      position: null,
      opportunity: {
        id: app.opportunity.id,
        organizationId: app.opportunity.organizationId,
        title: app.opportunity.title,
        description: app.opportunity.description,
        deadline: app.opportunity.deadline,
        seats: app.opportunity.seats,
        status: app.opportunity.status,
      },
    }))

    return {
      items: [...projectItems, ...opportunityItems].sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
      ),
    }
  }

  private async assertProjectOwner(projectId: string, ownerId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, createdById: true },
    })
    if (!project || project.createdById !== ownerId) {
      throw new NotFoundException({ code: 'NOT_FOUND', messageKey: 'errors.projectNotFound' })
    }
    return project
  }

  private toOwnerItem(application: {
    id: string
    projectId: string
    positionId: string | null
    applicantId: string
    message: string
    status: string
    rejectionReason: string | null
    decidedAt: Date | null
    createdAt: Date
    updatedAt: Date
    project: { id: string; title: string; pitch: string; status: string }
    position: { id: string; title: string; description: string | null } | null
    applicant: { talentProfile: { pseudonym: string; avatarSeed: string; headline: string | null } | null }
  }): OwnerApplicationItem {
    return {
      id: application.id,
      projectId: application.projectId,
      positionId: application.positionId,
      applicantId: application.applicantId,
      message: application.message,
      status: application.status as ApplicationStatus,
      rejectionReason: application.rejectionReason,
      decidedAt: application.decidedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      project: { ...application.project, status: application.project.status as ProjectStatus },
      position: application.position,
      candidate: application.applicant.talentProfile ?? {
        pseudonym: 'Profil indisponible',
        avatarSeed: 'default',
        headline: null,
      },
    }
  }

  async getProjectApplications(projectId: string, ownerId: string): Promise<OwnerApplicationsResponse> {
    await this.assertProjectOwner(projectId, ownerId)
    const applications = await this.prisma.application.findMany({
      where: { projectId },
      include: { project: true, position: true, applicant: { include: { talentProfile: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return { items: applications.map((application) => this.toOwnerItem(application)) }
  }

  async accept(ownerId: string, applicationId: string): Promise<OwnerApplicationItem> {
    return this.decide(ownerId, applicationId, ApplicationStatus.ACCEPTED)
  }

  async reject(ownerId: string, applicationId: string, input: RejectApplicationInput): Promise<OwnerApplicationItem> {
    return this.decide(ownerId, applicationId, ApplicationStatus.REJECTED, input.rejectionReason)
  }

  private async decide(
    ownerId: string,
    applicationId: string,
    status: 'ACCEPTED' | 'REJECTED',
    rejectionReason: string | null = null,
  ): Promise<OwnerApplicationItem> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { project: true, position: true, applicant: { include: { talentProfile: true } } },
    })
    if (!application) {
      throw new NotFoundException({ code: 'NOT_FOUND', messageKey: 'errors.applicationNotFound' })
    }
    await this.assertProjectOwner(application.projectId, ownerId)
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException({ code: 'APPLICATION_ALREADY_DECIDED', messageKey: 'errors.applicationAlreadyDecided' })
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.application.updateMany({
        where: { id: applicationId, status: ApplicationStatus.PENDING },
        data: { status, rejectionReason, decidedAt: new Date(), decidedById: ownerId },
      })
      if (result.count !== 1) {
        throw new BadRequestException({ code: 'APPLICATION_ALREADY_DECIDED', messageKey: 'errors.applicationAlreadyDecided' })
      }
      return tx.application.findUniqueOrThrow({
        where: { id: applicationId },
        include: { project: true, position: true, applicant: { include: { talentProfile: true } } },
      })
    })
    if (status === ApplicationStatus.ACCEPTED && this.notifications) {
      const applicant = this.prisma.user ? await this.prisma.user.findUnique({ where: { id: updated.applicantId }, select: { id: true, email: true, locale: true, talentProfile: { select: { pseudonym: true } } } }) : null
      if (applicant) {
        await this.notifications.notifyBusinessEvent({
          userId: applicant.id,
          recipient: applicant.email,
          displayName: applicant.talentProfile?.pseudonym ?? 'Membre',
          type: 'application.accepted',
          referenceId: updated.id,
          payload: { applicationId: updated.id, projectId: updated.projectId },
          locale: applicant.locale === 'mg' ? 'mg' : 'fr',
        })
      }
    }
    return this.toOwnerItem(updated)
  }

  async withdrawOpportunity(
    applicantId: string,
    applicationId: string,
  ): Promise<MyApplicationHistoryItem> {
    const application = await this.prisma.opportunityApplication.findUnique({
      where: { id: applicationId },
      include: { opportunity: true },
    })

    if (!application || application.applicantType !== 'TALENT' || application.applicantId !== applicantId) {
      throw new NotFoundException({ code: 'NOT_FOUND', messageKey: 'errors.applicationNotFound' })
    }
    if (
      application.status !== ApplicationStatus.PENDING ||
      application.opportunity.status !== 'PUBLISHED' ||
      (application.opportunity.deadline && application.opportunity.deadline < new Date())
    ) {
      throw new BadRequestException({ code: 'CANNOT_WITHDRAW', messageKey: 'errors.cannotWithdrawNonPending' })
    }

    const updated = await this.prisma.opportunityApplication.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.WITHDRAWN },
      include: { opportunity: true },
    })

    return {
      source: 'OPPORTUNITY',
      id: updated.id,
      opportunityId: updated.opportunityId,
      applicantId: updated.applicantId,
      message: updated.message,
      status: updated.status as ApplicationStatus,
      rejectionReason: updated.rejectionReason,
      createdAt: updated.createdAt,
      project: null,
      position: null,
      opportunity: {
        id: updated.opportunity.id,
        organizationId: updated.opportunity.organizationId,
        title: updated.opportunity.title,
        description: updated.opportunity.description,
        deadline: updated.opportunity.deadline,
        seats: updated.opportunity.seats,
        status: updated.opportunity.status,
      },
    }
  }

  async withdraw(
    applicantId: string,
    applicationId: string,
  ): Promise<ApplicationItem> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        project: true,
        position: true,
      },
    })

    if (!application || application.applicantId !== applicantId) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        messageKey: 'errors.applicationNotFound',
      })
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException({
        code: 'CANNOT_WITHDRAW',
        messageKey: 'errors.cannotWithdrawNonPending',
      })
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.WITHDRAWN,
      },
      include: {
        project: true,
        position: true,
      },
    })

    return {
      id: updated.id,
      projectId: updated.projectId,
      positionId: updated.positionId,
      applicantId: updated.applicantId,
      message: updated.message,
      status: updated.status as ApplicationStatus,
      rejectionReason: updated.rejectionReason,
      decidedAt: updated.decidedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      project: {
        id: updated.project.id,
        title: updated.project.title,
        pitch: updated.project.pitch,
        status: updated.project.status as ProjectStatus,
      },
      position: updated.position
        ? {
            id: updated.position.id,
            title: updated.position.title,
            description: updated.position.description,
          }
        : null,
    }
  }
}
