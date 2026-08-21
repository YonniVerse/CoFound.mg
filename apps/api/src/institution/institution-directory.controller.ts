import { Controller, Get, Query, Req } from '@nestjs/common'
import { institutionDirectoryQuerySchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { InstitutionDirectoryService } from './institution-directory.service.js'

@Controller('institution/directory')
export class InstitutionDirectoryController {
  constructor(private readonly service: InstitutionDirectoryService) {}
  @Get()
  @RequirePermissions(Permission.ORG_READ)
  list(@Query() query: unknown, @Req() request: AuthenticatedRequest) { const input = institutionDirectoryQuerySchema.parse(query); return this.service.list(input.organizationId, request.user!.userId, input) }
}
