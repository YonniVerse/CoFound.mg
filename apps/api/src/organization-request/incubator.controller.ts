import { Body, Controller, Get, Param, Post, Query, Req, Inject } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { Permission } from '../rbac/permissions.js'
import { IncubatorService } from './incubator.service.js'

@Controller('organizations/:organizationId/incubator')
@RequirePermissions(Permission.ORG_READ)
export class IncubatorController {
  constructor(@Inject(IncubatorService) private readonly service: IncubatorService) {}

  @Get('programs')
  listPrograms(@Param('organizationId') organizationId: string, @Req() request: AuthenticatedRequest) {
    return this.service.listPrograms(request.user!.userId, organizationId)
  }

  @Post('programs')
  createProgram(@Param('organizationId') organizationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.createProgram(request.user!.userId, organizationId, body)
  }

  @Post('programs/:programId/activate')
  activateProgram(@Param('organizationId') organizationId: string, @Param('programId') programId: string, @Req() request: AuthenticatedRequest) {
    return this.service.activateProgram(request.user!.userId, organizationId, programId)
  }

  @Get('programs/:programId/cohorts')
  listCohorts(@Param('organizationId') organizationId: string, @Param('programId') programId: string, @Req() request: AuthenticatedRequest) {
    return this.service.listCohorts(request.user!.userId, organizationId, programId)
  }

  @Post('programs/:programId/cohorts')
  createCohort(@Param('organizationId') organizationId: string, @Param('programId') programId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.createCohort(request.user!.userId, organizationId, programId, body)
  }

  @Post('cohorts/:cohortId/open')
  openCohort(@Param('organizationId') organizationId: string, @Param('cohortId') cohortId: string, @Req() request: AuthenticatedRequest) {
    return this.service.openCohort(request.user!.userId, organizationId, cohortId)
  }

  @Get('applications')
  listApplications(@Param('organizationId') organizationId: string, @Query() query: Record<string, unknown>, @Req() request: AuthenticatedRequest) {
    return this.service.listApplications(request.user!.userId, organizationId, query)
  }
}
