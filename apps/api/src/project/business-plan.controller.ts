import { Body, Controller, Get, Param, Patch, Post, Req, Inject } from '@nestjs/common'
import { bpPatchSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { BusinessPlanService } from './business-plan.service.js'

@Controller('projects/:projectId/business-plan')
export class BusinessPlanController {
  constructor(@Inject(BusinessPlanService) private readonly bpService: BusinessPlanService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  get(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.bpService.get(request.user!.userId, projectId)
  }

  @Patch()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  patch(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.bpService.patch(request.user!.userId, projectId, bpPatchSchema.parse(body))
  }

  @Post('sync')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  sync(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: { overwrite?: boolean }) {
    return this.bpService.syncFromUpstream(request.user!.userId, projectId, body?.overwrite === true)
  }
}
