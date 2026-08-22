import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { Permission } from '../rbac/permissions.js'
import { PartnerDiscoveryService } from './partner-discovery.service.js'

@Controller('organizations/:organizationId')
@RequirePermissions(Permission.ORG_READ)
export class PartnerDiscoveryController {
  constructor(private readonly service: PartnerDiscoveryService) {}

  @Get('projects/search')
  search(@Param('organizationId') organizationId: string, @Query() query: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.search(request.user!.userId, organizationId, query)
  }

  @Get('project-watches')
  listWatches(@Param('organizationId') organizationId: string, @Req() request: AuthenticatedRequest) {
    return this.service.listWatches(request.user!.userId, organizationId)
  }

  @Post('project-watches/:projectId')
  saveWatch(@Param('organizationId') organizationId: string, @Param('projectId') projectId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.saveWatch(request.user!.userId, organizationId, projectId, body)
  }

  @Delete('project-watches/:projectId')
  removeWatch(@Param('organizationId') organizationId: string, @Param('projectId') projectId: string, @Req() request: AuthenticatedRequest) {
    return this.service.removeWatch(request.user!.userId, organizationId, projectId)
  }
}
