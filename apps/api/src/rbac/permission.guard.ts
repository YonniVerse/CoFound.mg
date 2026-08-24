import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { ANONYMOUS_KEY, PERMISSIONS_KEY } from './rbac.decorators.js'
import { PLATFORM_ROLE_PERMISSIONS, Permission, type Permission as PermissionType } from './permissions.js'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAnonymous = this.reflector.getAllAndOverride<boolean>(ANONYMOUS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isAnonymous) return true

    const requiredPermissions = this.reflector.getAllAndOverride<PermissionType[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredPermissions?.length) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        messageKey: 'rbac.errors.permissionRequired',
      })
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    if (!request.user) {
      throw new UnauthorizedException({
        code: 'UNAUTHENTICATED',
        messageKey: 'auth.errors.accessTokenRequired',
      })
    }

    const granted = PLATFORM_ROLE_PERMISSIONS[request.user.platformRole] ?? []
    const staffCanAct = request.user.platformRole === 'STAFF' && ['MODERATOR', 'OPS_ADMIN', 'SUPER_ADMIN'].includes(request.user.staffRole ?? '')
    const superAdminOnly = request.user.platformRole === 'STAFF' && request.user.staffRole === 'SUPER_ADMIN'
    const canReadProductHealth = request.user.platformRole === 'STAFF' && ['OPS_ADMIN', 'SUPER_ADMIN'].includes(request.user.staffRole ?? '')
    const hasPermissions = requiredPermissions.every((permission) => {
      if (permission === Permission.MODERATION_ACT) return staffCanAct
      const superAdminPermissions: readonly PermissionType[] = [Permission.ORGANIZATION_REQUEST_READ, Permission.ORGANIZATION_REQUEST_MANAGE, Permission.ORGANIZATION_CAPABILITY_MANAGE, Permission.AUDIT_READ, Permission.REFERENCE_DATA_MANAGE]
      if (superAdminPermissions.includes(permission)) return superAdminOnly
      if (permission === Permission.PRODUCT_HEALTH_READ) return canReadProductHealth
      return granted.includes(permission)
    })
    if (!hasPermissions) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        messageKey: 'rbac.errors.insufficientPermissions',
      })
    }

    return true
  }
}
