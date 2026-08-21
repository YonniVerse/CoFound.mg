import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, TaskStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import type { CreateProjectTaskInput, ProjectTask, ProjectTasksResponse, UpdateProjectTaskInput } from '@cofound/shared'

const taskInclude = {
  assignee: { select: { id: true, talentProfile: { select: { pseudonym: true } } } },
} satisfies Prisma.TaskInclude

type TaskWithAssignee = Prisma.TaskGetPayload<{ include: typeof taskInclude }>

@Injectable()
export class ProjectTasksService {
  constructor(private readonly prisma: PrismaService) {}

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
      dueDate: task.dueDate,
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
    const tasks = await this.prisma.task.findMany({ where: { projectId }, include: taskInclude, orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'asc' }] })
    return { projectId, tasks: tasks.map((task) => this.toTask(task)) }
  }

  async create(projectId: string, requesterId: string, input: CreateProjectTaskInput) {
    await this.requireMember(projectId, requesterId)
    const task = await this.prisma.$transaction(async (transaction) => {
      await this.validateAssignee(transaction, projectId, input.assigneeId)
      return transaction.task.create({
        data: { projectId, title: input.title, description: input.description ?? null, assigneeId: input.assigneeId ?? null, dueDate: input.dueDate ?? null, status: (input.status ?? 'TODO') as TaskStatus },
        include: taskInclude,
      })
    })
    return this.toTask(task)
  }

  async update(projectId: string, taskId: string, requesterId: string, input: UpdateProjectTaskInput) {
    await this.requireMember(projectId, requesterId)
    const task = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.task.findFirst({ where: { id: taskId, projectId } })
      if (!existing) throw new NotFoundException({ code: 'TASK_NOT_FOUND', messageKey: 'errors.taskNotFound' })
      await this.validateAssignee(transaction, projectId, input.assigneeId)
      return transaction.task.update({ where: { id: taskId }, data: { ...input, status: input.status as TaskStatus | undefined, description: input.description === undefined ? undefined : input.description ?? null, assigneeId: input.assigneeId === undefined ? undefined : input.assigneeId ?? null, dueDate: input.dueDate === undefined ? undefined : input.dueDate ?? null }, include: taskInclude })
    })
    return this.toTask(task)
  }

  async remove(projectId: string, taskId: string, requesterId: string) {
    await this.requireMember(projectId, requesterId)
    await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.task.findFirst({ where: { id: taskId, projectId } })
      if (!existing) throw new NotFoundException({ code: 'TASK_NOT_FOUND', messageKey: 'errors.taskNotFound' })
      await transaction.task.delete({ where: { id: taskId } })
    })
    return { deleted: true, id: taskId }
  }
}
