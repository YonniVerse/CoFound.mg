import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ProfileModule } from '../profile/profile.module.js'
import { OnboardingController } from './onboarding.controller.js'
import { OnboardingService } from './onboarding.service.js'

@Module({
  imports: [PrismaModule, ProfileModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
