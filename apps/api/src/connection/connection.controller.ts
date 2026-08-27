import { Controller, Get, Param, Patch, Req, Inject } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ConnectionService } from './connection.service.js'

@Controller('connections')
export class ConnectionController {
  constructor(@Inject(ConnectionService) private readonly service: ConnectionService) {}
  @Patch('requests/:id/accept')
  @RequirePermissions(Permission.CONNECTION_REQUEST)
  accept(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.service.acceptRequest(req.user!.userId, id) }
  @Get()
  @RequirePermissions(Permission.CONNECTION_REQUEST)
  list(@Req() req: AuthenticatedRequest) { return this.service.list(req.user!.userId) }
  @Get(':id')
  @RequirePermissions(Permission.CONNECTION_REQUEST)
  get(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.service.get(req.user!.userId, id) }
}
