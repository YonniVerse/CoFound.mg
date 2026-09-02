import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject, Optional } from '@nestjs/common'
import { Prisma, ProjectRole, TaskPriority, TaskStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import { AuditService } from '../audit/audit.service.js'
import { NotificationService } from '../notifications/notification.service.js'
import type { CreateProjectTaskInput, ProjectTask, ProjectTasksResponse, UpdateProjectTaskInput } from '@cofound/shared'

const taskInclude = {
  assignee: { select: { id: true, talentProfile: { select: { pseudonym: true } } } },
} satisfies Prisma.TaskInclude

type TaskWithAssignee = Prisma.TaskGetPayload<{ include: typeof taskInclude }>

@Injectable()
export class ProjectTasksService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Optional() @Inject(AuditService) private readonly audit?: AuditService,
    @Optional() @Inject(NotificationService) private readonly notification?: NotificationService,
  ) {}

  private async requireMember(projectId: string, userId: string) {
    const membership = await this.prisma.projectMember.findFirst({ where: { projectId, userId, leftAt: null } })
    if (!membership) throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', messageKey: 'errors.projectNotFound' })
    return membership
  }

  private toTask(task: TaskWithAssignee): ProjectTask {
    return {
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      assigneePseudonym: task.assignee?.talentProfile?.pseudonym ?? null,
      startDate: task.startDate,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }

  private async validateAssignee(transaction: Prisma.TransactionClient | PrismaService, projectId: string, assigneeId: string | null | undefined) {
    if (assigneeId === undefined || assigneeId === null) return
    const membership = await transaction.projectMember.findFirst({ where: { projectId, userId: assigneeId, leftAt: null } })
    if (!membership) throw new BadRequestException({ code: 'ASSIGNEE_NOT_MEMBER', messageKey: 'errors.assigneeNotMember' })
  }

  async list(projectId: string, requesterId: string): Promise<ProjectTasksResponse> {
    await this.requireMember(projectId, requesterId)
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: taskInclude,
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'asc' }],
    })
    return { projectId, tasks: tasks.map((task) => this.toTask(task)) }
  }

  async create(projectId: string, requesterId: string, input: CreateProjectTaskInput) {
    const member = await this.requireMember(projectId, requesterId)
    if (member.role === ProjectRole.OBSERVER) {
      throw new ForbiddenException({ code: 'OBSERVER_READ_ONLY', messageKey: 'errors.observerReadOnly' })
    }

    const task = await this.prisma.$transaction(async (transaction) => {
      await this.validateAssignee(transaction, projectId, input.assigneeId)
      return transaction.task.create({
        data: {
          projectId,
          title: input.title,
          description: input.description ?? null,
          assigneeId: input.assigneeId ?? null,
          startDate: input.startDate ?? null,
          dueDate: input.dueDate ?? null,
          priority: (input.priority ?? 'MEDIUM') as TaskPriority,
          status: (input.status ?? 'TODO') as TaskStatus,
        },
        include: taskInclude,
      })
    })

    // Audit creation
    if (this.audit) {
      await this.audit.record({
        actorId: requesterId,
        action: 'PROJECT_TASK_CREATED',
        targetType: 'Task',
        targetId: task.id,
        metadata: { projectId, title: task.title, status: task.status },
      }).catch(() => undefined)
    }

    // In-app notification if assigned to another user
    if (this.notification && task.assigneeId && task.assigneeId !== requesterId) {
      await this.notification.create(task.assigneeId, 'TASK_ASSIGNED', {
        taskId: task.id,
        projectId,
        title: task.title,
        assignedById: requesterId,
      }).catch(() => undefined)
    }

    return this.toTask(task)
  }

  async update(projectId: string, taskId: string, requesterId: string, input: UpdateProjectTaskInput) {
    const member = await this.requireMember(projectId, requesterId)
    if (member.role === ProjectRole.OBSERVER) {
      throw new ForbiddenException({ code: 'OBSERVER_READ_ONLY', messageKey: 'errors.observerReadOnly' })
    }

    const task = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.task.findFirst({ where: { id: taskId, projectId } })
      if (!existing) throw new NotFoundException({ code: 'TASK_NOT_FOUND', messageKey: 'errors.taskNotFound' })
      await this.validateAssignee(transaction, projectId, input.assigneeId)

      const updated = await transaction.task.update({
        where: { id: taskId },
        data: {
          ...input,
          status: input.status as TaskStatus | undefined,
          priority: input.priority as TaskPriority | undefined,
          description: input.description === undefined ? undefined : input.description ?? null,
          assigneeId: input.assigneeId === undefined ? undefined : input.assigneeId ?? null,
          startDate: input.startDate === undefined ? undefined : input.startDate ?? null,
          dueDate: input.dueDate === undefined ? undefined : input.dueDate ?? null,
        },
        include: taskInclude,
      })

      return { existing, updated }
    })

    // Audit update
    if (this.audit) {
      await this.audit.record({
        actorId: requesterId,
        action: 'PROJECT_TASK_UPDATED',
        targetType: 'Task',
        targetId: taskId,
        metadata: {
          projectId,
          fromStatus: task.existing.status,
          toStatus: task.updated.status,
          assignedTo: task.updated.assigneeId,
        },
      }).catch(() => undefined)
    }

    // Notify new assignee if changed
    if (
      this.notification &&
      task.updated.assigneeId &&
      task.updated.assigneeId !== task.existing.assigneeId &&
      task.updated.assigneeId !== requesterId
    ) {
      await this.notification.create(task.updated.assigneeId, 'TASK_ASSIGNED', {
        taskId: task.updated.id,
        projectId,
        title: task.updated.title,
        assignedById: requesterId,
      }).catch(() => undefined)
    }

    return this.toTask(task.updated)
  }

  async remove(projectId: string, taskId: string, requesterId: string) {
    const member = await this.requireMember(projectId, requesterId)
    if (member.role === ProjectRole.OBSERVER || member.role === ProjectRole.MENTOR) {
      throw new ForbiddenException({ code: 'INSUFFICIENT_PROJECT_PERMISSIONS', messageKey: 'errors.insufficientPermissions' })
    }

    await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.task.findFirst({ where: { id: taskId, projectId } })
      if (!existing) throw new NotFoundException({ code: 'TASK_NOT_FOUND', messageKey: 'errors.taskNotFound' })
      await transaction.task.delete({ where: { id: taskId } })
    })

    if (this.audit) {
      await this.audit.record({
        actorId: requesterId,
        action: 'PROJECT_TASK_DELETED',
        targetType: 'Task',
        targetId: taskId,
        metadata: { projectId },
      }).catch(() => undefined)
    }

    return { deleted: true, id: taskId }
  }
}

