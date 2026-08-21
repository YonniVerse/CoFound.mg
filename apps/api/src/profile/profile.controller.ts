import { Body, Controller, Get, Patch, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProfileService } from './profile.service.js'

@Controller('me/profile')
@RequirePermissions(Permission.TALENT_READ)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getMine(@Req() request: AuthenticatedRequest) {
    return this.profileService.getMine(request.user!.userId)
  }

  @Patch()
  updateMine(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.profileService.updateMine(request.user!.userId, body)
  }
}
