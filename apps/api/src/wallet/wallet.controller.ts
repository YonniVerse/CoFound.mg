import { Body, Controller, Get, Param, Post, Req, Inject } from '@nestjs/common'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { WalletService } from './wallet.service.js'

@Controller('wallets')
export class WalletController {
  constructor(@Inject(WalletService) private readonly service: WalletService) {}

  @Get('organizations/:organizationId')
  getOrganization(@Param('organizationId') organizationId: string, @Req() request: AuthenticatedRequest) {
    return this.service.getOrganizationWallet(request.user!.userId, organizationId)
  }

  @Post('organizations/:organizationId/credit')
  creditOrganization(@Param('organizationId') organizationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.creditOrganization(request.user!.userId, organizationId, body)
  }

  @Post('organizations/:organizationId/debit')
  debitOrganization(@Param('organizationId') organizationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.debitOrganization(request.user!.userId, organizationId, body)
  }

  @Get('projects/:projectId')
  getProject(@Param('projectId') projectId: string, @Req() request: AuthenticatedRequest) {
    return this.service.getProjectWallet(request.user!.userId, projectId)
  }

  @Post('projects/:projectId/credit')
  creditProject(@Param('projectId') projectId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.creditProject(request.user!.userId, projectId, body)
  }

  @Post('projects/:projectId/debit')
  debitProject(@Param('projectId') projectId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.service.debitProject(request.user!.userId, projectId, body)
  }
}
