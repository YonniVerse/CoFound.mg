import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ProfileController, ProfileIdentityController } from './profile.controller.js'
import { ProfileService } from './profile.service.js'
import { CompletionReminderController } from './completion-reminder.controller.js'
import { CompletionReminderService } from './completion-reminder.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController, ProfileIdentityController, CompletionReminderController],
  providers: [ProfileService, CompletionReminderService],
})
export class ProfileModule {}
