import { Body, Controller, Param, Post, Req } from '@nestjs/common'
import { importApplyInputSchema } from '@cofound/shared'
import { AuditAction } from '../audit/audit.decorator.js'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ImportApplyService } from './import-apply.service.js'

@Controller('institution/imports')
@RequirePermissions(Permission.ORG_READ)
export class ImportApplyController {
  constructor(private readonly importApplyService: ImportApplyService) {}

  @Post(':id/apply')
  @AuditAction('IMPORT_APPLY', 'ImportBatch')
  async apply(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    const parsed = importApplyInputSchema.parse({ ...(typeof body === 'object' && body !== null ? body : {}), batchId: id })
    return this.importApplyService.apply(parsed, request.user!.userId)
  }
}
