import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { AllowAnonymous, RequirePermissions } from '../rbac/rbac.decorators.js'
import { Permission } from '../rbac/permissions.js'
import { OpportunityService } from './opportunity.service.js'

@Controller('opportunities')
export class PublicOpportunityController {
  constructor(private readonly service: OpportunityService) {}

  @Get()
  @AllowAnonymous()
  listPublished() {
    return this.service.listPublished()
  }

  @Post(':opportunityId/applications')
  @RequirePermissions(Permission.PROJECT_APPLY)
  apply(@Param('opportunityId') opportunityId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.apply(request.user!.userId, opportunityId, body)
  }
}

@Controller('organizations/:organizationId/opportunities')
@RequirePermissions(Permission.ORG_READ)
export class OrganizationOpportunityController {
  constructor(private readonly service: OpportunityService) {}

  @Post()
  create(@Param('organizationId') organizationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.create(request.user!.userId, organizationId, body)
  }

  @Post(':opportunityId/publish')
  publish(@Param('organizationId') organizationId: string, @Param('opportunityId') opportunityId: string, @Req() request: AuthenticatedRequest) {
    return this.service.publish(request.user!.userId, organizationId, opportunityId)
  }

  @Get(':opportunityId/applications')
  listApplications(@Param('organizationId') organizationId: string, @Param('opportunityId') opportunityId: string, @Req() request: AuthenticatedRequest) {
    return this.service.listApplications(request.user!.userId, organizationId, opportunityId)
  }

  @Post(':opportunityId/applications/:applicationId/decision')
  decideApplication(@Param('organizationId') organizationId: string, @Param('applicationId') applicationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.decideApplication(request.user!.userId, organizationId, applicationId, body)
  }
}
