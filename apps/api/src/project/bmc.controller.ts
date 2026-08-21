import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common'
import { bmcPatchSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { BmcService } from './bmc.service.js'

@Controller('projects/:projectId/bmc')
export class BmcController {
  constructor(private readonly bmcService: BmcService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  get(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.bmcService.get(request.user!.userId, projectId)
  }

  @Patch()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  patch(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.bmcService.patch(request.user!.userId, projectId, bmcPatchSchema.parse(body))
  }
}
