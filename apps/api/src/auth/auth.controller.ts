import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { AuditAction } from '../audit/audit.decorator.js'
import {
  activationInputSchema,
  loginInputSchema,
  passwordResetInputSchema,
  passwordResetRequestSchema,
} from '@cofound/shared'

const REFRESH_COOKIE = 'cofound_refresh_token'
const REFRESH_COOKIE_PATH = '/api/v1/auth'
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

type ResponseWithHeaders = {
  setHeader(name: string, value: string): void
}

type RequestWithCookies = {
  headers: { cookie?: string }
  cookies?: Record<string, string | undefined>
}

export function serializeRefreshCookie(token: string, expiresAt: Date, env: NodeJS.ProcessEnv = process.env): string {
  const isProduction = env.NODE_ENV === 'production'
  const sameSite = isProduction ? 'None' : 'Lax'
  const secure = isProduction ? '; Secure' : ''
  return `${REFRESH_COOKIE}=${token}; HttpOnly; Path=${REFRESH_COOKIE_PATH}; SameSite=${sameSite}; Max-Age=${REFRESH_COOKIE_MAX_AGE}; Expires=${expiresAt.toUTCString()}${secure}`
}

export function serializeExpiredRefreshCookie(env: NodeJS.ProcessEnv = process.env): string {
  const isProduction = env.NODE_ENV === 'production'
  const sameSite = isProduction ? 'None' : 'Lax'
  const secure = isProduction ? '; Secure' : ''
  return `${REFRESH_COOKIE}=; HttpOnly; Path=${REFRESH_COOKIE_PATH}; Max-Age=0; SameSite=${sameSite}${secure}`
}

@AllowAnonymous()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AuditAction('AUTH_LOGIN', 'User')
  @Post('login')
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: ResponseWithHeaders) {
    const session = await this.authService.login(loginInputSchema.parse(body))
    response.setHeader('Set-Cookie', serializeRefreshCookie(session.refreshToken, session.refreshTokenExpiresAt))
    return { accessToken: session.accessToken }
  }

  @AuditAction('AUTH_ACTIVATE', 'User')
  @Post('activate')
  async activate(@Body() body: unknown, @Res({ passthrough: true }) response: ResponseWithHeaders) {
    const session = await this.authService.activate(activationInputSchema.parse(body))
    response.setHeader('Set-Cookie', serializeRefreshCookie(session.refreshToken, session.refreshTokenExpiresAt))
    return { accessToken: session.accessToken }
  }

  @AuditAction('AUTH_REFRESH', 'RefreshToken')
  @Post('refresh')
  async refresh(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: ResponseWithHeaders) {
    const refreshToken = this.readRefreshCookie(request)
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant.')
    }
    const session = await this.authService.refresh(refreshToken)
    response.setHeader('Set-Cookie', serializeRefreshCookie(session.refreshToken, session.refreshTokenExpiresAt))
    return { accessToken: session.accessToken }
  }

  @AuditAction('AUTH_LOGOUT', 'RefreshToken')
  @Post('logout')
  async logout(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: ResponseWithHeaders) {
    await this.authService.logout(this.readRefreshCookie(request))
    response.setHeader('Set-Cookie', serializeExpiredRefreshCookie())
    return { ok: true }
  }

  @AuditAction('AUTH_PASSWORD_RESET_REQUEST', 'User')
  @Post('password-reset/request')
  async requestPasswordReset(@Body() body: unknown) {
    const input = passwordResetRequestSchema.parse(body)
    await this.authService.requestPasswordReset(input.email)
    return { accepted: true }
  }

  @AuditAction('AUTH_PASSWORD_RESET_COMPLETE', 'User')
  @Post('password-reset/complete')
  async completePasswordReset(@Body() body: unknown) {
    await this.authService.resetPassword(passwordResetInputSchema.parse(body))
    return { ok: true }
  }

  private readRefreshCookie(request: RequestWithCookies): string | undefined {
    const parsedCookie = request.cookies?.[REFRESH_COOKIE]
    if (parsedCookie) return parsedCookie

    const rawCookie = request.headers.cookie
    if (!rawCookie) return undefined
    const cookie = rawCookie.split(';').find((part) => part.trim().startsWith(`${REFRESH_COOKIE}=`))
    return cookie?.split('=').slice(1).join('=')
  }
}
