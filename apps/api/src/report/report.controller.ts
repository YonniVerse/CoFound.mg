import { Body, Controller, Inject, Patch, Post, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Param } from '@nestjs/common'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ReportService } from './report.service.js'

@Controller('reports')
@RequirePermissions(Permission.TALENT_READ)
export class ReportController {
  constructor(@Inject(ReportService) private readonly reportService: ReportService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.reportService.create(request.user!.userId, body)
  }

  @Patch(':id/resolve')
  @RequirePermissions(Permission.MODERATION_ACT)
  resolve(@Req() request: AuthenticatedRequest, @Body() body: unknown, @Param('id') id: string) {
    return this.reportService.resolve(request.user!.userId, id, body)
  }
}
