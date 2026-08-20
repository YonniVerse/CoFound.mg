import { Module } from '@nestjs/common'
import { NotificationsQueueService } from './notifications-queue.service.js'

@Module({
  providers: [NotificationsQueueService],
  exports: [NotificationsQueueService],
})
export class NotificationsModule {}
