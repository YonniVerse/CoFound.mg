import { Module } from '@nestjs/common'
import { NotificationsModule } from '../notifications/notifications.module.js'
import { ReportController } from './report.controller.js'
import { ReportService } from './report.service.js'

@Module({
  imports: [NotificationsModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
