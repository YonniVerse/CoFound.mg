import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common'
import { AuditAction } from '../audit/audit.decorator.js'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ImportBatchService } from './import-batch.service.js'

@Controller('institution/imports')
export class ImportBatchController {
  constructor(private readonly importBatchService: ImportBatchService) {}

  @Get()
  @RequirePermissions(Permission.ORG_READ)
  async list(@Req() request: AuthenticatedRequest) {
    return this.importBatchService.list(request.user!.userId)
  }

  @Get(':id')
  @RequirePermissions(Permission.ORG_READ)
  async detail(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.importBatchService.detail(id, request.user!.userId)
  }

  @Post(':id/cancel')
  @RequirePermissions(Permission.ORG_READ)
  @AuditAction('IMPORT_CANCEL', 'ImportBatch')
  async cancel(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    const confirmation = typeof body === 'object' && body !== null && 'confirmation' in body && typeof body.confirmation === 'string' ? body.confirmation : ''
    return this.importBatchService.cancel(id, request.user!.userId, confirmation)
  }

  @Post(':id/activation-links')
  @RequirePermissions(Permission.ORG_READ)
  @AuditAction('IMPORT_ACTIVATION_LINKS', 'ImportBatch')
  async activationLinks(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.importBatchService.activationLinks(id, request.user!.userId)
  }

  @Post(':id/resend-invitations')
  @RequirePermissions(Permission.ORG_READ)
  @AuditAction('IMPORT_RESEND_INVITATIONS', 'ImportBatch')
  async resendInvitations(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.importBatchService.resendInvitations(id, request.user!.userId)
  }
}
