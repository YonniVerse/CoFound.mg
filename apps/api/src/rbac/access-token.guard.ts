import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { jwtVerify } from 'jose'
import { getJwtSecret } from '../auth/jwt-secret.js'
import { ANONYMOUS_KEY } from './rbac.decorators.js'
import type { AuthenticatedRequest } from '../auth/auth-request.js'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAnonymous = this.reflector.getAllAndOverride<boolean>(ANONYMOUS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isAnonymous) return true

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const authorization = request.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'UNAUTHENTICATED',
        messageKey: 'auth.errors.accessTokenRequired',
      })
    }

    const token = authorization.slice('Bearer '.length).trim()
    try {
      const verified = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] })
      const userId = verified.payload.sub
      const platformRole = verified.payload.platformRole
      const status = verified.payload.status
      if (typeof userId !== 'string' || typeof platformRole !== 'string' || typeof status !== 'string') {
        throw new Error('JWT claims invalides')
      }
      request.user = { userId, platformRole, status }
      return true
    } catch {
      throw new UnauthorizedException({
        code: 'UNAUTHENTICATED',
        messageKey: 'auth.errors.invalidAccessToken',
      })
    }
  }
}
