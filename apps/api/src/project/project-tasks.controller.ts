import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req } from '@nestjs/common'
import { createProjectTaskSchema, updateProjectTaskSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProjectTasksService } from './project-tasks.service.js'

function parseBody<T>(schema: { safeParse: (body: unknown) => { success: true; data: T } | { success: false } }, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', messageKey: 'errors.validation' })
  return result.data
}

@Controller('projects/:projectId/tasks')
export class ProjectTasksController {
  constructor(@Inject(ProjectTasksService) private readonly tasksService: ProjectTasksService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  list(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.tasksService.list(projectId, request.user!.userId)
  }

  @Post()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  create(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.tasksService.create(projectId, request.user!.userId, parseBody(createProjectTaskSchema, body))
  }

  @Patch(':taskId')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  update(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Param('taskId') taskId: string, @Body() body: unknown) {
    return this.tasksService.update(projectId, taskId, request.user!.userId, parseBody(updateProjectTaskSchema, body))
  }

  @Delete(':taskId')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  remove(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Param('taskId') taskId: string) {
    return this.tasksService.remove(projectId, taskId, request.user!.userId)
  }
}
