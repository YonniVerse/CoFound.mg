import { Body, Controller, Get, Param, Post, Req, Inject } from '@nestjs/common'
import { crossToolSyncRequestSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { JourneyService } from './journey.service.js'

@Controller('projects/:projectId/journey')
export class JourneyController {
  constructor(@Inject(JourneyService) private readonly journeyService: JourneyService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  get(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.journeyService.get(request.user!.userId, projectId)
  }

  @Post('sync')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  sync(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.journeyService.sync(request.user!.userId, projectId, crossToolSyncRequestSchema.parse(body))
  }
}
