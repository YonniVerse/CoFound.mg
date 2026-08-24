import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { AuditAction } from '../audit/audit.decorator.js'
import { OrganizationRequestStaffService } from './organization-request-staff.service.js'

@Controller('staff/organization-requests')
@RequirePermissions(Permission.ORGANIZATION_REQUEST_READ)
export class OrganizationRequestStaffController {
  constructor(private readonly service: OrganizationRequestStaffService) {}

  @Get()
  list(@Query() query: unknown) {
    return this.service.list(query)
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id)
  }

  @Get(':id/documents/:index')
  @AuditAction('ORGANIZATION_REQUEST_DOCUMENT_ACCESSED', 'OrganizationRequest')
  getDocumentUrl(@Param('id') id: string, @Param('index') index: string, @Req() request: AuthenticatedRequest) {
    return this.service.getDocumentUrl(request.user!.userId, id, index)
  }

  @Post(':id/approve')
  @RequirePermissions(Permission.ORGANIZATION_REQUEST_MANAGE)
  @AuditAction('ORGANIZATION_REQUEST_APPROVED', 'OrganizationRequest')
  approve(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.service.approve(request.user!.userId, id)
  }

  @Post(':id/reject')
  @RequirePermissions(Permission.ORGANIZATION_REQUEST_MANAGE)
  @AuditAction('ORGANIZATION_REQUEST_REJECTED', 'OrganizationRequest')
  reject(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.reject(request.user!.userId, id, body)
  }
}

@Controller('organizations')
@RequirePermissions(Permission.ORGANIZATION_CAPABILITY_MANAGE)
export class OrganizationCapabilityController {
  constructor(private readonly service: OrganizationRequestStaffService) {}

  @Post(':organizationId/capabilities')
  @AuditAction('ORGANIZATION_CAPABILITY_GRANTED', 'OrganizationCapability')
  grant(@Param('organizationId') organizationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.grantCapability(request.user!.userId, organizationId, body)
  }

  @Delete(':organizationId/capabilities/:capability')
  @AuditAction('ORGANIZATION_CAPABILITY_REVOKED', 'OrganizationCapability')
  revoke(@Param('organizationId') organizationId: string, @Param('capability') capability: string, @Req() request: AuthenticatedRequest) {
    return this.service.revokeCapability(request.user!.userId, organizationId, capability)
  }
}
