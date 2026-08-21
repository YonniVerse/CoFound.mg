import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { InstitutionOverviewController } from './institution-overview.controller.js'
import { InstitutionMembersController } from './institution-members.controller.js'
import { InstitutionOverviewService } from './institution-overview.service.js'
import { InstitutionMembersService } from './institution-members.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [InstitutionOverviewController, InstitutionMembersController],
  providers: [InstitutionOverviewService, InstitutionMembersService],
})
export class InstitutionModule {}
