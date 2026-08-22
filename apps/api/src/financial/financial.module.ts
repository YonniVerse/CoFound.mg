import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { FinancialEngagementController } from './financial-engagement.controller.js'
import { FinancialEngagementService } from './financial-engagement.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [FinancialEngagementController],
  providers: [FinancialEngagementService],
})
export class FinancialModule {}
