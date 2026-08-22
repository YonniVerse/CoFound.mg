import { Controller, Get, Inject, Param, Patch, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { NotificationService } from './notification.service.js'

@Controller('notifications')
@RequirePermissions(Permission.TALENT_READ)
export class NotificationController {
  constructor(@Inject(NotificationService) private readonly service: NotificationService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) { return this.service.list(req.user!.userId) }

  @Patch(':id/read')
  read(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.service.markRead(req.user!.userId, id) }
}
