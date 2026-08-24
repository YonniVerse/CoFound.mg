import { Controller, Get, Param } from '@nestjs/common'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { OrganizationProfileService } from './organization-profile.service.js'

@Controller('organizations')
@AllowAnonymous()
export class OrganizationProfileController {
  constructor(private readonly service: OrganizationProfileService) {}

  @Get(':organizationId/profile')
  getPublicProfile(@Param('organizationId') organizationId: string) {
    return this.service.getPublicProfile(organizationId)
  }
}
