import { Controller, Get, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from './permissions.js'
import { RequirePermissions } from './rbac.decorators.js'

@Controller('me')
@RequirePermissions(Permission.TALENT_READ)
export class MeController {
  @Get()
  getCurrentUser(@Req() request: AuthenticatedRequest) {
    return request.user
  }
}
