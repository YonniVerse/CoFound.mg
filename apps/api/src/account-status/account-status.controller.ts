import { Controller, Get, Inject, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { AccountStatusService } from './account-status.service.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'

@Controller('me/status')
@RequirePermissions(Permission.TALENT_READ)
export class AccountStatusController {
  constructor(@Inject(AccountStatusService) private readonly service: AccountStatusService) {}

  @Get()
  getMine(@Req() request: AuthenticatedRequest) {
    return this.service.getMine(request.user!.userId)
  }
}
