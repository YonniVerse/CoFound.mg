import { Inject, Injectable } from '@nestjs/common'
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { tap } from 'rxjs'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { AUDIT_ACTION_KEY, type AuditActionMetadata } from './audit.decorator.js'
import { AuditService } from './audit.service.js'

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly reflector: Reflector

  constructor(@Inject(Reflector) reflector: Reflector = new Reflector(), @Inject(AuditService) private readonly auditService: AuditService) {
    this.reflector = reflector
  }

  intercept(context: ExecutionContext, next: CallHandler) {


    const metadata = this.reflector.getAllAndOverride<AuditActionMetadata>(AUDIT_ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!metadata) return next.handle()

    const request = context.switchToHttp().getRequest<AuthenticatedRequest & {
      method?: string
      originalUrl?: string
      params?: Record<string, string | undefined>
      ip?: string
    }>()

    return next.handle().pipe(
      tap(() => {
        const targetId = request.params?.id ?? request.params?.userId ?? request.user?.userId ?? 'system'
        void this.auditService.record({
          actorId: request.user?.userId,
          actorRole: request.user?.platformRole,
          action: metadata.action,
          targetType: metadata.targetType,
          targetId,
          metadata: {
            method: request.method ?? 'UNKNOWN',
            path: request.originalUrl ?? 'UNKNOWN',
          },
          ip: request.ip,
        })
      }),
    )
  }
}
