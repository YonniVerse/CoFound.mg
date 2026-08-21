import { Module } from '@nestjs/common'
import { NotificationsModule } from '../notifications/notifications.module.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ImportApplyController } from './import-apply.controller.js'
import { ImportApplyService } from './import-apply.service.js'

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ImportApplyController],
  providers: [ImportApplyService],
})
export class ImportModule {}
