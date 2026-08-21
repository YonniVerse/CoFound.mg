import { SetMetadata } from '@nestjs/common'

export const AUDIT_ACTION_KEY = 'cofound:audit-action'

export type AuditActionMetadata = {
  action: string
  targetType: string
}

export const AuditAction = (action: string, targetType: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, targetType } satisfies AuditActionMetadata)
