import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ProjectController } from './project.controller.js'
import { ProjectService } from './project.service.js'
import { BmcController } from './bmc.controller.js'
import { BmcService } from './bmc.service.js'
import { PositionController } from './position.controller.js'
import { PositionService } from './position.service.js'
import { ProjectMembersController } from './project-members.controller.js'
import { ProjectMembersService } from './project-members.service.js'
import { ProjectTasksController } from './project-tasks.controller.js'
import { ProjectTasksService } from './project-tasks.service.js'
import { ProjectPostsController } from './project-posts.controller.js'
import { ProjectPostsService } from './project-posts.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController, BmcController, PositionController, ProjectMembersController, ProjectTasksController, ProjectPostsController],
  providers: [ProjectService, BmcService, PositionService, ProjectMembersService, ProjectTasksService, ProjectPostsService],
})
export class ProjectModule {}
