import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { InstitutionOverviewController } from './institution-overview.controller.js'
import { InstitutionOverviewService } from './institution-overview.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [InstitutionOverviewController],
  providers: [InstitutionOverviewService],
})
export class InstitutionModule {}
