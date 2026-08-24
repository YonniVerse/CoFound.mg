import { Body, Controller, Get, Inject, Patch, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { DreamMatchService } from './dream-match.service.js'

@Controller('me/dream-match')
@RequirePermissions(Permission.TALENT_SELF)
export class DreamMatchController {
  constructor(@Inject(DreamMatchService) private readonly dreamMatchService: DreamMatchService) {}

  @Get()
  getMine(@Req() request: AuthenticatedRequest) {
    return this.dreamMatchService.getMine(request.user!.userId)
  }

  @Patch()
  updateMine(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.dreamMatchService.upsertMine(request.user!.userId, body)
  }
}
