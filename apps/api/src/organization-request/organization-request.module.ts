import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { OrganizationRequestController } from './organization-request.controller.js'
import { OrganizationRequestStaffController, OrganizationCapabilityController } from './organization-request-staff.controller.js'
import { OrganizationProfileController } from './organization-profile.controller.js'
import { OrganizationRequestService } from './organization-request.service.js'
import { OrganizationRequestStaffService } from './organization-request-staff.service.js'
import { OrganizationProfileService } from './organization-profile.service.js'
import { PartnerDiscoveryController } from './partner-discovery.controller.js'
import { PartnerDiscoveryService } from './partner-discovery.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationRequestController, OrganizationRequestStaffController, OrganizationCapabilityController, OrganizationProfileController, PartnerDiscoveryController],
  providers: [OrganizationRequestService, OrganizationRequestStaffService, OrganizationProfileService, PartnerDiscoveryService],
})
export class OrganizationRequestModule {}
