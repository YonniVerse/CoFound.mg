import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common'
import { projectCreateSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProjectService } from './project.service.js'

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @RequirePermissions(Permission.PROJECT_CREATE)
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.projectService.create(request.user!.userId, projectCreateSchema.parse(body))
  }

  @Get(':id')
  @RequirePermissions(Permission.PROJECT_READ)
  getById(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.projectService.getById(request.user!.userId, id)
  }
}
