import { Body, Controller, Get, Param, Patch, Req, Inject } from '@nestjs/common'
import { financePatchSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { FinanceService } from './finance.service.js'

@Controller('projects/:projectId/finances')
export class FinanceController {
  constructor(@Inject(FinanceService) private readonly financeService: FinanceService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  get(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.financeService.get(request.user!.userId, projectId)
  }

  @Patch()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  patch(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.financeService.patch(request.user!.userId, projectId, financePatchSchema.parse(body))
  }
}
