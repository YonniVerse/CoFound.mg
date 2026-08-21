import { Module } from '@nestjs/common'
import { DreamMatchController } from './dream-match.controller.js'
import { DreamMatchService } from './dream-match.service.js'

@Module({
  controllers: [DreamMatchController],
  providers: [DreamMatchService],
})
export class DreamMatchModule {}
