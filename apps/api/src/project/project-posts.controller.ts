import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req } from '@nestjs/common'
import { projectPostCreateSchema, projectPostUpdateSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProjectPostsService } from './project-posts.service.js'

function parseBody<T>(schema: { safeParse: (body: unknown) => { success: true; data: T } | { success: false } }, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', messageKey: 'errors.validation' })
  return result.data
}

@Controller('projects/:projectId/posts')
export class ProjectPostsController {
  constructor(@Inject(ProjectPostsService) private readonly projectPostsService: ProjectPostsService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  list(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.projectPostsService.list(projectId, request.user!.userId)
  }

  @Post()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  create(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.projectPostsService.create(projectId, request.user!.userId, parseBody(projectPostCreateSchema, body))
  }

  @Patch(':postId')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  update(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Param('postId') postId: string, @Body() body: unknown) {
    return this.projectPostsService.update(projectId, postId, request.user!.userId, parseBody(projectPostUpdateSchema, body))
  }

  @Delete(':postId')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  remove(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Param('postId') postId: string) {
    return this.projectPostsService.remove(projectId, postId, request.user!.userId)
  }
}
