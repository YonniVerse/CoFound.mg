import { Module } from '@nestjs/common'
import { ApplicationsController } from './applications.controller.js'
import { ApplicationsService } from './applications.service.js'
import { ApplicationReminderService } from './application-reminder.service.js'

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationReminderService],
  exports: [ApplicationsService, ApplicationReminderService],
})
export class ApplicationsModule {}
