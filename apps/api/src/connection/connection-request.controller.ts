import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common'
import { contactRequestCreateSchema, contactRequestDecisionSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ConnectionRequestService } from './connection-request.service.js'
import { ConnectionService } from './connection.service.js'

@Controller('connections/requests')
export class ConnectionRequestController {
  constructor(private readonly service: ConnectionRequestService, private readonly connectionService: ConnectionService) {}
  @Post()
  @RequirePermissions(Permission.CONNECTION_REQUEST)
  create(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const parsed = contactRequestCreateSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', messageKey: 'errors.validation' })
    return this.service.create(req.user!.userId, parsed.data)
  }
  @Get('incoming')
  @RequirePermissions(Permission.CONNECTION_REQUEST)
  list(@Req() req: AuthenticatedRequest) { return this.service.listIncoming(req.user!.userId) }
  @Patch(':id')
  @RequirePermissions(Permission.CONNECTION_REQUEST)
  decide(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    const parsed = contactRequestDecisionSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', messageKey: 'errors.validation' })
    return parsed.data.decision === 'ACCEPTED'
      ? this.connectionService.acceptRequest(req.user!.userId, id)
      : this.service.decide(req.user!.userId, id, parsed.data)
  }
}
