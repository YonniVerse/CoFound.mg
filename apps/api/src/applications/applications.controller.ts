import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
} from '@nestjs/common'
import { ApplicationsService } from './applications.service.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { Permission } from '../rbac/permissions.js'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import {
  createApplicationInputSchema,
  type ApplicationItem,
  type MyApplicationsResponse,
} from '@cofound/shared'

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @RequirePermissions(Permission.PROJECT_APPLY)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<ApplicationItem> {
    const input = createApplicationInputSchema.parse(body)
    const userId = req.user!.userId
    return this.applicationsService.create(userId, input)
  }

  @Get('me')
  @RequirePermissions(Permission.PROJECT_APPLY)
  async getMyApplications(
    @Req() req: AuthenticatedRequest,
  ): Promise<MyApplicationsResponse> {
    const userId = req.user!.userId
    return this.applicationsService.getMyApplications(userId)
  }

  @Patch(':id/withdraw')
  @RequirePermissions(Permission.PROJECT_APPLY)
  async withdraw(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ApplicationItem> {
    const userId = req.user!.userId
    return this.applicationsService.withdraw(userId, id)
  }
}
