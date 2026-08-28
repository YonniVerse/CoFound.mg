import { BadRequestException, Body, Controller, Get, Param, Post, Req, Inject } from '@nestjs/common'
import { projectCreateSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProjectService } from './project.service.js'

@Controller('projects')
export class ProjectController {
  constructor(@Inject(ProjectService) private readonly projectService: ProjectService) {}

  @Get('mine')
  @RequirePermissions(Permission.PROJECT_READ)
  getMine(@Req() request: AuthenticatedRequest) {
    return this.projectService.getMine(request.user!.userId)
  }

  @Post()
  @RequirePermissions(Permission.PROJECT_CREATE)
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const parsed = projectCreateSchema.safeParse(body)
    if (!parsed.success) {
      throw new BadRequestException({ code: 'VALIDATION_FAILED', messageKey: 'errors.validation', details: { issues: parsed.error.issues } })
    }
    return this.projectService.create(request.user!.userId, parsed.data, request.user!.status)
  }

  @Post(':id/recruiting')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  publish(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.projectService.publish(request.user!.userId, id)
  }

  @Get(':id')
  @RequirePermissions(Permission.PROJECT_READ)
  getById(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.projectService.getById(request.user!.userId, id)
  }
}
