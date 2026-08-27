import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuditModule } from '../audit/audit.module.js'
import { WalletController } from './wallet.controller.js'
import { WalletService } from './wallet.service.js'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
