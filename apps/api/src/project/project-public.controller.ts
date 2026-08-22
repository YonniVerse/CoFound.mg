import { Controller, Get, Inject, Param } from '@nestjs/common'
import { ProjectPublicService } from './project-public.service.js'

@Controller('projects')
export class ProjectPublicController {
  constructor(@Inject(ProjectPublicService) private readonly projectPublicService: ProjectPublicService) {}

  @Get(':id/public')
  getPublic(@Param('id') id: string) {
    return this.projectPublicService.getPublic(id)
  }
}
