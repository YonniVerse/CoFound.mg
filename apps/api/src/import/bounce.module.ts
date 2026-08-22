import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { BounceController } from './bounce.controller.js'
import { BounceService } from './bounce.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [BounceController],
  providers: [BounceService],
})
export class BounceModule {}
