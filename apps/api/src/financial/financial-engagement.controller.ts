import { Body, Controller, Param, Post, Req, Inject } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { Permission } from '../rbac/permissions.js'
import { FinancialEngagementService } from './financial-engagement.service.js'

@Controller('organizations/:organizationId/financial-engagements')
@RequirePermissions(Permission.ORG_READ)
export class FinancialEngagementController {
  constructor(@Inject(FinancialEngagementService) private readonly service: FinancialEngagementService) {}

  @Post()
  create(@Param('organizationId') organizationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.create(request.user!.userId, organizationId, body)
  }
}
