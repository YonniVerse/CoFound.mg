import { createHash, randomBytes } from 'node:crypto'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as argon2 from 'argon2'
import { PrismaService } from '../prisma/prisma.service.js'
import { ApiErrorCode, type ActivationInput, type LoginInput, type PasswordResetInput } from '@cofound/shared'
import { SignJWT } from 'jose'

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60
const PASSWORD_RESET_TTL_SECONDS = 60 * 60

export type AuthSession = {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: Date
}

@Injectable()
export class AuthService {
  private readonly jwtSecret = this.getJwtSecret()

  constructor(private readonly prisma: PrismaService) {}

  async login(input: LoginInput): Promise<AuthSession> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })

    if (!user || !user.passwordHash || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException({
        code: ApiErrorCode.UNAUTHENTICATED,
        messageKey: 'auth.errors.invalidCredentials',
      })
    }

    if (user.status === 'FROZEN') {
      throw new UnauthorizedException({
        code: ApiErrorCode.ACCOUNT_FROZEN,
        messageKey: 'auth.errors.accountFrozen',
      })
    }

    if (user.status === 'DISABLED' || user.status === 'INVITED') {
      throw new UnauthorizedException({
        code: ApiErrorCode.UNAUTHENTICATED,
        messageKey: 'auth.errors.accountNotActive',
      })
    }

    const session = await this.createSession(user.id, user.platformRole, user.status)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    return session
  }

  async activate(input: ActivationInput): Promise<AuthSession> {
    const tokenHash = this.hashToken(input.token)
    const invitation = await this.prisma.invitationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })

    if (!invitation || invitation.usedAt || invitation.expiresAt <= new Date() || invitation.user.status !== 'INVITED') {
      throw new UnauthorizedException({
        code: ApiErrorCode.TOKEN_EXPIRED,
        messageKey: 'auth.errors.invalidInvitation',
      })
    }

    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id })
    const now = new Date()
    const user = await this.prisma.$transaction(async (transaction) => {
      await transaction.invitationToken.update({
        where: { id: invitation.id },
        data: { usedAt: now },
      })
      return transaction.user.update({
        where: { id: invitation.userId },
        data: {
          passwordHash,
          status: 'ACTIVE',
          locale: input.locale,
          activatedAt: now,
        },
      })
    })

    return this.createSession(user.id, user.platformRole, user.status)
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    const tokenHash = this.hashToken(refreshToken)
    const now = new Date()

    return this.prisma.$transaction(async (transaction) => {
      const current = await transaction.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      })

      if (!current || current.expiresAt <= now) {
        throw new UnauthorizedException({
          code: ApiErrorCode.TOKEN_EXPIRED,
          messageKey: 'auth.errors.invalidRefreshToken',
        })
      }

      if (current.revokedAt || current.replacedBy) {
        await transaction.refreshToken.updateMany({
          where: { familyId: current.familyId, revokedAt: null },
          data: { revokedAt: now },
        })
        throw new UnauthorizedException({
          code: ApiErrorCode.TOKEN_REUSED,
          messageKey: 'auth.errors.refreshTokenReused',
        })
      }

      if (current.user.status === 'FROZEN' || current.user.status === 'DISABLED') {
        throw new UnauthorizedException({
          code: ApiErrorCode.UNAUTHENTICATED,
          messageKey: 'auth.errors.accountNotActive',
        })
      }

      const nextRawToken = this.createRawToken()
      const nextHash = this.hashToken(nextRawToken)
      const nextExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000)
      await transaction.refreshToken.update({
        where: { id: current.id },
        data: { revokedAt: now, replacedBy: nextHash },
      })
      await transaction.refreshToken.create({
        data: {
          userId: current.userId,
          tokenHash: nextHash,
          familyId: current.familyId,
          expiresAt: nextExpiresAt,
        },
      })

      return {
        accessToken: await this.createAccessToken(current.userId, current.user.platformRole, current.user.status),
        refreshToken: nextRawToken,
        refreshTokenExpiresAt: nextExpiresAt,
      }
    })
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || user.status === 'DISABLED') return

    const rawToken = this.createRawToken()
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(rawToken),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000),
      },
    })
    // E-02 branchera l’envoi transactionnel. Aucun jeton brut n’est renvoyé par l’API.
  }

  async resetPassword(input: PasswordResetInput): Promise<void> {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashToken(input.token) },
    })
    if (!token || token.usedAt || token.expiresAt <= new Date()) {
      throw new UnauthorizedException({
        code: ApiErrorCode.TOKEN_EXPIRED,
        messageKey: 'auth.errors.invalidPasswordResetToken',
      })
    }

    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id })
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({ where: { userId: token.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ])
  }

  private async createSession(userId: string, platformRole: string, status: string): Promise<AuthSession> {
    const rawRefreshToken = this.createRawToken()
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000)
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(rawRefreshToken),
        familyId: this.createRawToken(),
        expiresAt: refreshTokenExpiresAt,
      },
    })
    return {
      accessToken: await this.createAccessToken(userId, platformRole, status),
      refreshToken: rawRefreshToken,
      refreshTokenExpiresAt,
    }
  }

  private async createAccessToken(userId: string, platformRole: string, status: string): Promise<string> {
    return new SignJWT({ platformRole, status })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
      .sign(this.jwtSecret)
  }

  private createRawToken(): string {
    return randomBytes(48).toString('base64url')
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  private getJwtSecret(): Uint8Array {
    const configuredSecret = process.env.JWT_SECRET
    if (configuredSecret) return new TextEncoder().encode(configuredSecret)
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET est obligatoire en production.')
    }
    return new TextEncoder().encode('cofound-local-development-secret-change-me')
  }
}
