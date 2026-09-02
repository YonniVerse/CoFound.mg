import { Body, Controller, Get, Param, Patch, Post, Req, Inject } from '@nestjs/common'
import { dtPatchSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { DesignThinkingService } from './design-thinking.service.js'

@Controller('projects/:projectId/design-thinking')
export class DesignThinkingController {
  constructor(@Inject(DesignThinkingService) private readonly dtService: DesignThinkingService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  get(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.dtService.get(request.user!.userId, projectId)
  }

  @Patch()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  patch(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.dtService.patch(request.user!.userId, projectId, dtPatchSchema.parse(body))
  }

  @Post('iterations')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  addIteration(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: { title?: string }) {
    return this.dtService.addIteration(request.user!.userId, projectId, body?.title)
  }

  @Patch('iterations/active')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  setActiveIteration(
    @Req() request: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Body() body: { index: number }
  ) {
    return this.dtService.setActiveIteration(request.user!.userId, projectId, body?.index ?? 0)
  }
}
