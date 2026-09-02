import { Body, Controller, Get, Param, Patch, Post, Req, Inject } from '@nestjs/common'
import { pitchGenerateInputSchema, pitchPatchSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { PitchService } from './pitch.service.js'

@Controller('projects/:projectId/pitch')
export class PitchController {
  constructor(@Inject(PitchService) private readonly pitchService: PitchService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  get(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.pitchService.get(request.user!.userId, projectId)
  }

  @Patch()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  patch(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.pitchService.patch(request.user!.userId, projectId, pitchPatchSchema.parse(body))
  }

  @Post('generate')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  generate(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    return this.pitchService.generate(request.user!.userId, projectId, pitchGenerateInputSchema.parse(body))
  }
}
