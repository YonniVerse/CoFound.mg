import { Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { BlockService } from './block.service.js'

@Controller('blocks')
export class BlockController {
  constructor(private readonly service: BlockService) {}

  @Post(':userId')
  @RequirePermissions(Permission.TALENT_READ)
  create(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    return this.service.create(req.user!.userId, userId)
  }

  @Delete(':userId')
  @RequirePermissions(Permission.TALENT_READ)
  remove(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    return this.service.remove(req.user!.userId, userId)
  }

  @Get()
  @RequirePermissions(Permission.TALENT_READ)
  list(@Req() req: AuthenticatedRequest) {
    return this.service.list(req.user!.userId)
  }
}
