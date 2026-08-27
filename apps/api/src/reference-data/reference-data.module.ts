import { Module } from '@nestjs/common'
import { PublicReferenceDataController } from './public-reference-data.controller.js'
import { ReferenceDataController } from './reference-data.controller.js'
import { ReferenceDataService } from './reference-data.service.js'

@Module({
  controllers: [ReferenceDataController, PublicReferenceDataController],
  providers: [ReferenceDataService],
})
export class ReferenceDataModule {}
