import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { InstitutionOverviewController } from './institution-overview.controller.js'
import { InstitutionMembersController } from './institution-members.controller.js'
import { InstitutionOverviewService } from './institution-overview.service.js'
import { InstitutionMembersService } from './institution-members.service.js'
import { InstitutionAffiliationController } from './institution-affiliation.controller.js'
import { InstitutionAffiliationService } from './institution-affiliation.service.js'
import { InstitutionDirectoryController } from './institution-directory.controller.js'
import { InstitutionDirectoryService } from './institution-directory.service.js'
import { InstitutionDashboardController } from './institution-dashboard.controller.js'
import { InstitutionDashboardService } from './institution-dashboard.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [
    InstitutionOverviewController,
    InstitutionMembersController,
    InstitutionAffiliationController,
    InstitutionDirectoryController,
    InstitutionDashboardController,
  ],
  providers: [
    InstitutionOverviewService,
    InstitutionMembersService,
    InstitutionAffiliationService,
    InstitutionDirectoryService,
    InstitutionDashboardService,
  ],
})
export class InstitutionModule {}
