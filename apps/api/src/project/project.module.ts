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
import { ProjectExportController } from './project-export.controller.js'
import { ProjectExportService } from './project-export.service.js'
import { ProjectPublicController } from './project-public.controller.js'
import { ProjectPublicService } from './project-public.service.js'

import { DesignThinkingController } from './design-thinking.controller.js'
import { DesignThinkingService } from './design-thinking.service.js'
import { BusinessPlanController } from './business-plan.controller.js'
import { BusinessPlanService } from './business-plan.service.js'
import { FinanceController } from './finance.controller.js'
import { FinanceService } from './finance.service.js'
import { PitchController } from './pitch.controller.js'
import { PitchService } from './pitch.service.js'
import { JourneyController } from './journey.controller.js'
import { JourneyService } from './journey.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [
    ProjectController,
    JourneyController,
    DesignThinkingController,
    BmcController,
    BusinessPlanController,
    FinanceController,
    PitchController,
    PositionController,
    ProjectMembersController,
    ProjectTasksController,
    ProjectPostsController,
    ProjectExportController,
    ProjectPublicController,
  ],
  providers: [
    ProjectService,
    JourneyService,
    DesignThinkingService,
    BmcService,
    BusinessPlanService,
    FinanceService,
    PitchService,
    PositionService,
    ProjectMembersService,
    ProjectTasksService,
    ProjectPostsService,
    ProjectExportService,
    ProjectPublicService,
  ],
  exports: [
    ProjectService,
    JourneyService,
    DesignThinkingService,
    BmcService,
    BusinessPlanService,
    FinanceService,
    PitchService,
  ],
})
export class ProjectModule {}

