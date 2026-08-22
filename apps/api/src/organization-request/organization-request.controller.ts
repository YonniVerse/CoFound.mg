import { Body, Controller, Post } from '@nestjs/common'
import { AuditAction } from '../audit/audit.decorator.js'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { OrganizationRequestService } from './organization-request.service.js'

@AllowAnonymous()
@Controller('organization-requests')
export class OrganizationRequestController {
  constructor(private readonly organizationRequestService: OrganizationRequestService) {}

  @Post()
  @AuditAction('ORGANIZATION_REQUEST_CREATE', 'OrganizationRequest')
  create(@Body() body: unknown) {
    return this.organizationRequestService.create(body)
  }
}
