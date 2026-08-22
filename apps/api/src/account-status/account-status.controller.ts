import { Controller, Get, Inject, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { AccountStatusService } from './account-status.service.js'

@Controller('me/status')
export class AccountStatusController {
  constructor(@Inject(AccountStatusService) private readonly service: AccountStatusService) {}

  @Get()
  getMine(@Req() request: AuthenticatedRequest) {
    return this.service.getMine(request.user!.userId)
  }
}
