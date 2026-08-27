import { Controller, Get, Param, Req, Inject } from '@nestjs/common'
import { idSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { PrivacyService } from './privacy.service.js'

@Controller('talents')
@RequirePermissions(Permission.TALENT_READ)
export class PrivacyController {
  constructor(@Inject(PrivacyService) private readonly privacyService: PrivacyService) {}

  @Get(':talentId')
  getTalent(@Req() request: AuthenticatedRequest, @Param('talentId') talentId: string) {
    return this.privacyService.getTalentView(request.user!.userId, idSchema.parse(talentId))
  }
}
