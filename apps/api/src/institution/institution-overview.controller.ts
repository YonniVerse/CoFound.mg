import { Controller, Get, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { InstitutionOverviewService } from './institution-overview.service.js'

@Controller('institution')
export class InstitutionOverviewController {
  constructor(private readonly overviewService: InstitutionOverviewService) {}

  @Get('overview')
  @RequirePermissions(Permission.ORG_READ)
  getOverview(@Req() request: AuthenticatedRequest) {
    return this.overviewService.getMine(request.user!.userId)
  }
}
