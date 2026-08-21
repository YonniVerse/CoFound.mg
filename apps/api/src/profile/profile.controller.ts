import { Body, Controller, Get, Inject, Patch, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProfileService } from './profile.service.js'

@Controller('me/profile')
@RequirePermissions(Permission.TALENT_READ)
export class ProfileController {
  constructor(@Inject(ProfileService) private readonly profileService: ProfileService) {}

  @Get()
  getMine(@Req() request: AuthenticatedRequest) {
    return this.profileService.getMine(request.user!.userId)
  }

  @Patch()
  updateMine(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.profileService.updateMine(request.user!.userId, body)
  }
}

@Controller('me/identity')
@RequirePermissions(Permission.TALENT_READ)
export class ProfileIdentityController {
  constructor(@Inject(ProfileService) private readonly profileService: ProfileService) {}
  @Get()
  getIdentity(@Req() request: AuthenticatedRequest) {
    return this.profileService.getIdentity(request.user!.userId)
  }
  @Patch()
  updateIdentity(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.profileService.updateIdentity(request.user!.userId, body)
  }
}
