import { Controller, Get, Inject, Query, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { DreamMatchScoringService } from './dream-match-scoring.service.js'

@Controller('me/dream-match/suggestions')
@RequirePermissions(Permission.TALENT_READ)
export class DreamMatchScoringController {
  constructor(@Inject(DreamMatchScoringService) private readonly scoringService: DreamMatchScoringService) {}

  @Get()
  getSuggestions(@Req() request: AuthenticatedRequest, @Query() query: unknown) {
    return this.scoringService.getSuggestions(request.user!.userId, query)
  }
}
