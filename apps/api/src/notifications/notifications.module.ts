import { Module } from '@nestjs/common'
import { NotificationsQueueService } from './notifications-queue.service.js'
import { EmailTemplateService } from './email-template.service.js'
import { NotificationController } from './notification.controller.js'
import { NotificationService } from './notification.service.js'

@Module({
  controllers: [NotificationController],
  providers: [NotificationsQueueService, EmailTemplateService, NotificationService],
  exports: [NotificationsQueueService, EmailTemplateService, NotificationService],
})
export class NotificationsModule {}
