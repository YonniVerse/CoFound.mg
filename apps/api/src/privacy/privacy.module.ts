import { Module } from '@nestjs/common'
import { PrivacyController } from './privacy.controller.js'
import { PrivacyService } from './privacy.service.js'
import { PersonalDataExportController } from './personal-data-export.controller.js'
import { PersonalDataExportService } from './personal-data-export.service.js'
import { PersonalDataExportQueueService } from './personal-data-export-queue.service.js'

@Module({
  controllers: [PrivacyController, PersonalDataExportController],
  providers: [PrivacyService, PersonalDataExportService, PersonalDataExportQueueService],
  exports: [PrivacyService, PersonalDataExportService],
})
export class PrivacyModule {}
