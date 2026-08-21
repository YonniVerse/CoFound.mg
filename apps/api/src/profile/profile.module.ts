import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ProfileController, ProfileIdentityController } from './profile.controller.js'
import { ProfileService } from './profile.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController, ProfileIdentityController],
  providers: [ProfileService],
})
export class ProfileModule {}
