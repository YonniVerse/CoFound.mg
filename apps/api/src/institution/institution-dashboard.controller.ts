import { Controller, Get, Query, Req, Inject } from '@nestjs/common'
import { institutionDashboardQuerySchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { InstitutionDashboardService } from './institution-dashboard.service.js'

@Controller('institution/dashboard')
export class InstitutionDashboardController {
  constructor(
    @Inject(InstitutionDashboardService)
    private readonly dashboardService: InstitutionDashboardService
  ) {}

  @Get()
  @RequirePermissions(Permission.ORG_READ)
  getDashboard(@Req() request: AuthenticatedRequest, @Query() query: unknown) {
    const parsed = institutionDashboardQuerySchema.parse(query)
    return this.dashboardService.getDashboard(request.user!.userId, parsed.organizationId)
  }
}
