import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { OrganizationRequestController } from './organization-request.controller.js'
import { OrganizationRequestStaffController, OrganizationCapabilityController } from './organization-request-staff.controller.js'
import { OrganizationRequestService } from './organization-request.service.js'
import { OrganizationRequestStaffService } from './organization-request-staff.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationRequestController, OrganizationRequestStaffController, OrganizationCapabilityController],
  providers: [OrganizationRequestService, OrganizationRequestStaffService],
})
export class OrganizationRequestModule {}
