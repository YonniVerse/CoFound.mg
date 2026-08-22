import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common'
import { openPositionCreateSchema, openPositionPatchSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { PositionService } from './position.service.js'

@Controller('projects/:projectId/positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  list(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.positionService.list(request.user!.userId, projectId)
  }

  @Post()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  create(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.positionService.create(request.user!.userId, projectId, openPositionCreateSchema.parse(body))
  }

  @Patch(':positionId')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  update(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Param('positionId') positionId: string, @Body() body: unknown) {
    return this.positionService.update(request.user!.userId, projectId, positionId, openPositionPatchSchema.parse(body))
  }
}
