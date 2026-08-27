import { Body, Controller, Delete, Get, Param, Post, Query, Req, Inject } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { Permission } from '../rbac/permissions.js'
import { PartnerDiscoveryService } from './partner-discovery.service.js'

@Controller('organizations/:organizationId')
@RequirePermissions(Permission.ORG_READ)
export class PartnerDiscoveryController {
  constructor(@Inject(PartnerDiscoveryService) private readonly service: PartnerDiscoveryService) {}

  @Get('projects/search')
  search(@Param('organizationId') organizationId: string, @Query() query: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.search(request.user!.userId, organizationId, query)
  }

  @Get('talents/search')
  searchTalents(@Param('organizationId') organizationId: string, @Query() query: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.searchTalents(request.user!.userId, organizationId, query)
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
