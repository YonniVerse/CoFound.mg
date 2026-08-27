import { Controller, Get, Query, Inject } from '@nestjs/common'
import { TalentsService } from './talents.service.js'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { talentFeedQuerySchema, type TalentFeedResponse } from '@cofound/shared'

@AllowAnonymous()
@Controller('talents')
export class TalentsController {
  constructor(@Inject(TalentsService) private readonly talentsService: TalentsService) {}

  @Get('feed')
  async getFeed(@Query() query: Record<string, unknown>): Promise<TalentFeedResponse> {
    const parsedQuery = talentFeedQuerySchema.parse(query)
    return this.talentsService.getFeed(parsedQuery)
  }
}
