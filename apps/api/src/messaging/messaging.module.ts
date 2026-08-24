import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { NotificationsModule } from '../notifications/notifications.module.js'
import { MessagingController } from './messaging.controller.js'
import { MessagingService } from './messaging.service.js'

@Module({ imports: [PrismaModule, NotificationsModule], controllers: [MessagingController], providers: [MessagingService], exports: [MessagingService] })
export class MessagingModule {}
