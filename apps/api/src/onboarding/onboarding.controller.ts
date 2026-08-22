import { Body, Controller, Get, Inject, Param, Patch, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { OnboardingService } from './onboarding.service.js'

@Controller('me/onboarding')
@RequirePermissions(Permission.TALENT_READ)
export class OnboardingController {
  constructor(@Inject(OnboardingService) private readonly onboardingService: OnboardingService) {}
  @Get()
  getMine(@Req() request: AuthenticatedRequest) { return this.onboardingService.getMine(request.user!.userId) }
  @Patch('steps/:step')
  saveStep(@Req() request: AuthenticatedRequest, @Param('step') step: string, @Body() body: unknown) { return this.onboardingService.saveStep(request.user!.userId, { ...(body as Record<string, unknown>), step: Number(step) }) }
}
