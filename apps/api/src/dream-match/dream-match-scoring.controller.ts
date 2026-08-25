import { Controller, Get, Inject, Param, Post, Query, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { DreamMatchScoringService } from './dream-match-scoring.service.js'

@Controller('me/dream-match/suggestions')
@RequirePermissions(Permission.TALENT_SELF)
export class DreamMatchScoringController {
  constructor(@Inject(DreamMatchScoringService) private readonly scoringService: DreamMatchScoringService) {}

  @Get()
  getSuggestions(@Req() request: AuthenticatedRequest, @Query() query: unknown) {
    return this.scoringService.getSuggestions(request.user!.userId, query)
  }

  @Post(':talentId/not-interested')
  markNotInterested(@Req() request: AuthenticatedRequest, @Param('talentId') talentId: string) {
    return this.scoringService.markNotInterested(request.user!.userId, talentId)
  }
}
