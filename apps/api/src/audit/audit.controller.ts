import { Controller, Get, Header, Query, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { AuditService } from './audit.service.js'

@Controller('staff/audit')
@RequirePermissions(Permission.AUDIT_READ)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(@Query() query: unknown) {
    return this.auditService.list(query)
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="cofound-audit.csv"')
  async export(@Req() request: AuthenticatedRequest, @Query() query: unknown) {
    await this.auditService.record({ actorId: request.user!.userId, actorRole: request.user!.staffRole ?? request.user!.platformRole, action: 'AUDIT_LOG_EXPORT', targetType: 'AuditLog', targetId: 'audit-log-export', metadata: { format: 'csv' } })
    const result = await this.auditService.list(query)
    const header = ['horodatage', 'acteur', 'rôle', 'action', 'type_objet', 'identifiant_objet', 'adresse_ip', 'metadonnees']
    const rows = result.items.map((item) => [item.createdAt.toISOString(), item.actorId ?? 'système', item.actorRole ?? '', item.action, item.targetType, item.targetId, item.ip ?? '', JSON.stringify(item.metadata ?? {})])
    return [header, ...rows].map((row) => row.map((value) => this.escapeCsv(value)).join(',')).join('\n') + '\n'
  }

  private escapeCsv(value: string) {
    return `"${value.replaceAll('"', '""')}"`
  }
}
