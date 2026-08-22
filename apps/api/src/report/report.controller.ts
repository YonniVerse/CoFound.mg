import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ReportService } from './report.service.js'

@Controller('reports')
export class ReportController {
  constructor(@Inject(ReportService) private readonly reportService: ReportService) {}

  @Post()
  @RequirePermissions(Permission.TALENT_READ)
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.reportService.create(request.user!.userId, body)
  }

  @Get('moderation-queue')
  @RequirePermissions(Permission.MODERATION_READ)
  list(@Query() query: unknown) {
    return this.reportService.list(query)
  }

  @Patch(':id/decision')
  @RequirePermissions(Permission.MODERATION_ACT)
  decide(@Req() request: AuthenticatedRequest, @Body() body: unknown, @Param('id') id: string) {
    return this.reportService.decide(request.user!.userId, id, body)
  }

  @Patch(':id/resolve')
  @RequirePermissions(Permission.MODERATION_ACT)
  resolve(@Req() request: AuthenticatedRequest, @Body() body: unknown, @Param('id') id: string) {
    return this.reportService.resolve(request.user!.userId, id, body)
  }

  @Get(':id/identity')
  @RequirePermissions(Permission.MODERATION_ACT)
  revealIdentity(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.reportService.revealIdentity(request.user!.userId, id)
  }
}
