import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { OrganizationRequestController } from './organization-request.controller.js'
import { OrganizationRequestService } from './organization-request.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationRequestController],
  providers: [OrganizationRequestService],
})
export class OrganizationRequestModule {}
