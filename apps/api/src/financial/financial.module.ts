import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { FinancialEngagementController } from './financial-engagement.controller.js'
import { FinancialEngagementService } from './financial-engagement.service.js'
import { OffPlatformPaymentProvider } from './off-platform-payment.provider.js'

@Module({
  imports: [PrismaModule],
  controllers: [FinancialEngagementController],
  providers: [FinancialEngagementService, OffPlatformPaymentProvider],
})
export class FinancialModule {}
