import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AuditModule } from './audit/audit.module.js'
import { AuthModule } from './auth/auth.module.js'
import { HealthController } from './health/health.controller.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { AccessTokenGuard } from './rbac/access-token.guard.js'
import { PermissionGuard } from './rbac/permission.guard.js'
import { MeController } from './rbac/me.controller.js'
import { PrivacyModule } from './privacy/privacy.module.js'

@Module({
  imports: [PrismaModule, AuthModule, PrivacyModule, AuditModule],
  controllers: [HealthController, MeController],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}
