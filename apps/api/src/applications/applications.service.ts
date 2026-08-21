import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import {
  ApplicationStatus,
  ProjectStatus,
  type CreateApplicationInput,
  type ApplicationItem,
  type MyApplicationsResponse,
} from '@cofound/shared'

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const applications = await this.prisma.application.findMany({
      where: { applicantId },
      include: {
        project: true,
        position: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const items: ApplicationItem[] = applications.map((app) => ({
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
        ? {
            id: app.position.id,
            title: app.position.title,
            description: app.position.description,
          }
        : null,
    }))

    return { items }
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
