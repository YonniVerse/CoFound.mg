import { Controller, Get, Query } from '@nestjs/common'
import { projectFeedQuerySchema, projectPostFeedQuerySchema, type ProjectFeedResponse, type ProjectPostFeedResponse } from '@cofound/shared'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { ProjectsService } from './projects.service.js'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('feed')
  @AllowAnonymous()
  async getFeed(@Query() query: Record<string, unknown>): Promise<ProjectFeedResponse> {
    const parsedQuery = projectFeedQuerySchema.parse(query)
    return this.projectsService.getFeed(parsedQuery)
  }

  @Get('posts/feed')
  @AllowAnonymous()
  async getPostsFeed(@Query() query: Record<string, unknown>): Promise<ProjectPostFeedResponse> {
    const parsedQuery = projectPostFeedQuerySchema.parse(query)
    return this.projectsService.getPostsFeed(parsedQuery)
  }
}
