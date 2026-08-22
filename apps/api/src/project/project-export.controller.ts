import { Controller, Get, Header, Inject, Param, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProjectExportService } from './project-export.service.js'

@Controller('projects/:projectId/export')
export class ProjectExportController {
  constructor(@Inject(ProjectExportService) private readonly projectExportService: ProjectExportService) {}

  @Get()
  @Header('Content-Type', 'application/json; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="project-archive.json"')
  @RequirePermissions(Permission.PROJECT_READ)
  export(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.projectExportService.export(projectId, request.user!.userId)
  }
}
