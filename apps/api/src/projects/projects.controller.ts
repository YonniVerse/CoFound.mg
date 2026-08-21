import { Controller, Get, Query } from '@nestjs/common'
import { ProjectsService } from './projects.service.js'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { projectFeedQuerySchema, type ProjectFeedResponse } from '@cofound/shared'

@AllowAnonymous()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('feed')
  async getFeed(@Query() query: Record<string, unknown>): Promise<ProjectFeedResponse> {
    const parsedQuery = projectFeedQuerySchema.parse(query)
    return this.projectsService.getFeed(parsedQuery)
  }
}
