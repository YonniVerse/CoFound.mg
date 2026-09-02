import { Module } from '@nestjs/common'
import { NotificationsModule } from '../notifications/notifications.module.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ImportApplyController } from './import-apply.controller.js'
import { ImportApplyService } from './import-apply.service.js'
import { ImportBatchController } from './import-batch.controller.js'
import { ImportBatchService } from './import-batch.service.js'
import { ImportUploadController } from './import-upload.controller.js'
import { ImportUploadService } from './import-upload.service.js'

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ImportApplyController, ImportBatchController, ImportUploadController],
  providers: [ImportApplyService, ImportBatchService, ImportUploadService],
})
export class ImportModule {}

