import { Module } from '@nestjs/common'
import { DreamMatchController } from './dream-match.controller.js'
import { DreamMatchService } from './dream-match.service.js'
import { DreamMatchScoringController } from './dream-match-scoring.controller.js'
import { DreamMatchScoringService } from './dream-match-scoring.service.js'

@Module({
  controllers: [DreamMatchController, DreamMatchScoringController],
  providers: [DreamMatchService, DreamMatchScoringService],
})
export class DreamMatchModule {}
