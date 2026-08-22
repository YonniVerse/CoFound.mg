import { Module } from '@nestjs/common'
import { NotificationsModule } from '../notifications/notifications.module.js'
import { ApplicationsController } from './applications.controller.js'
import { ApplicationsService } from './applications.service.js'
import { ApplicationReminderService } from './application-reminder.service.js'

@Module({
  imports: [NotificationsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationReminderService],
  exports: [ApplicationsService, ApplicationReminderService],
})
export class ApplicationsModule {}
