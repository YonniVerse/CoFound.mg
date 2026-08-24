import { Body, Controller, Param, Post, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { Permission } from '../rbac/permissions.js'
import { PartnerContactService } from './partner-contact.service.js'

@Controller('organizations/:organizationId/projects/:projectId/contact')
@RequirePermissions(Permission.ORG_READ)
export class PartnerContactController {
  constructor(private readonly service: PartnerContactService) {}

  @Post()
  contact(@Param('organizationId') organizationId: string, @Param('projectId') projectId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.contact(request.user!.userId, organizationId, projectId, body)
  }
}
