import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup'
import { AuditModule } from './audit/audit.module.js'
import { AuthModule } from './auth/auth.module.js'
import { HealthController } from './health/health.controller.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { AccessTokenGuard } from './rbac/access-token.guard.js'
import { PermissionGuard } from './rbac/permission.guard.js'
import { MeController } from './rbac/me.controller.js'
import { PrivacyModule } from './privacy/privacy.module.js'
import { BounceModule } from './import/bounce.module.js'
import { ImportModule } from './import/import.module.js'
import { ProfileModule } from './profile/profile.module.js'
import { OnboardingModule } from './onboarding/onboarding.module.js'
import { ConsentModule } from './consent/consent.module.js'
import { InstitutionModule } from './institution/institution.module.js'
import { ApplicationsModule } from './applications/applications.module.js'
import { ProjectModule } from './project/project.module.js'
import { ConnectionModule } from './connection/connection.module.js'
import { MessagingModule } from './messaging/messaging.module.js'
import { SearchModule } from './search/search.module.js'
import { ProjectsModule } from './projects/projects.module.js'
import { TalentsModule } from './talents/talents.module.js'
import { DreamMatchModule } from './dream-match/dream-match.module.js'
import { ReportModule } from './report/report.module.js'
import { BlockModule } from './block/block.module.js'
import { AccountStatusModule } from './account-status/account-status.module.js'
import { OrganizationRequestModule } from './organization-request/organization-request.module.js'
import { FinancialModule } from './financial/financial.module.js'

@Module({
  imports: [SentryModule.forRoot(), PrismaModule, AuthModule, PrivacyModule, AuditModule, BounceModule, ImportModule, AccountStatusModule, ProfileModule, OnboardingModule, ConsentModule, InstitutionModule, ApplicationsModule, ProjectModule, ConnectionModule, MessagingModule, SearchModule, ProjectsModule, TalentsModule, DreamMatchModule, ReportModule, BlockModule, OrganizationRequestModule, FinancialModule],
  controllers: [HealthController, MeController],
  providers: [
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
  ],
})
export class AppModule {}
