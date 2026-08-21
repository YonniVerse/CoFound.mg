import { Module } from '@nestjs/common'
import { NotificationsQueueService } from './notifications-queue.service.js'
import { EmailTemplateService } from './email-template.service.js'

@Module({
  providers: [NotificationsQueueService, EmailTemplateService],
  exports: [NotificationsQueueService, EmailTemplateService],
})
export class NotificationsModule {}
