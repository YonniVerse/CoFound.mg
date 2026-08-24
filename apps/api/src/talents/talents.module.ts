import { Module } from '@nestjs/common'
import { TalentsController } from './talents.controller.js'
import { TalentsService } from './talents.service.js'

@Module({
  controllers: [TalentsController],
  providers: [TalentsService],
  exports: [TalentsService],
})
export class TalentsModule {}
