import { Body, Controller, Get, Param, Patch, Post, Query, Req, Inject } from '@nestjs/common'
import { affiliationBulkStatusSchema, affiliationFiltersSchema, affiliationUpdateSchema } from '@cofound/shared'
import { AuditAction } from '../audit/audit.decorator.js'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { InstitutionAffiliationService } from './institution-affiliation.service.js'

@Controller()
export class InstitutionAffiliationController {
  constructor(@Inject(InstitutionAffiliationService) private readonly service: InstitutionAffiliationService) {}
  @Get('institution/affiliations') @RequirePermissions(Permission.ORG_READ)
  list(@Query() query: unknown, @Req() request: AuthenticatedRequest) { return this.service.list(String((query as Record<string, unknown>).organizationId ?? ''), request.user!.userId, affiliationFiltersSchema.parse(query)) }
  @Patch('affiliations/:id') @RequirePermissions(Permission.ORG_READ) @AuditAction('AFFILIATION_STATUS_UPDATE', 'Affiliation')
  update(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) { return this.service.update(id, request.user!.userId, affiliationUpdateSchema.parse(body).status) }
  @Post('institution/affiliations/bulk-status') @RequirePermissions(Permission.ORG_READ) @AuditAction('AFFILIATION_BULK_STATUS', 'Affiliation')
  bulk(@Body() body: unknown, @Req() request: AuthenticatedRequest) { const input = affiliationBulkStatusSchema.parse(body); return this.service.bulkStatus(request.user!.userId, input.affiliationIds, input.status, input.confirmation) }
}
