import { Body, Controller, Delete, Get, Inject, Param, Post, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ConsentService } from './consent.service.js'

@Controller('me/consents')
@RequirePermissions(Permission.TALENT_READ)
export class ConsentController {
  constructor(@Inject(ConsentService) private readonly service: ConsentService) {}

  @Get()
  listMine(@Req() request: AuthenticatedRequest) { return this.service.listMine(request.user!.userId) }

  @Post(':purpose')
  grant(@Req() request: AuthenticatedRequest, @Param('purpose') purpose: string, @Body() body: unknown) { return this.service.grant(request.user!.userId, purpose, body) }

  @Delete(':purpose')
  revoke(@Req() request: AuthenticatedRequest, @Param('purpose') purpose: string, @Body() body: unknown) { return this.service.revoke(request.user!.userId, purpose, body) }
}
