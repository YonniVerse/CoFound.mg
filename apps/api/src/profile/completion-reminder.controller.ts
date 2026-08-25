import { Controller, Get, Inject, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { CompletionReminderService } from './completion-reminder.service.js'

@Controller('me/profile/completion-reminder')
@RequirePermissions(Permission.TALENT_SELF)
export class CompletionReminderController {
  constructor(@Inject(CompletionReminderService) private readonly service: CompletionReminderService) {}

  @Get()
  getMine(@Req() request: AuthenticatedRequest) {
    return this.service.getMine(request.user!.userId)
  }
}
