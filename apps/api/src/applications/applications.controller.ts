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
  ownerApplicationsResponseSchema,
  rejectApplicationInputSchema,
  type OwnerApplicationsResponse,
  type RejectApplicationInput,
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

  @Get('project/:projectId')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  async getProjectApplications(
    @Req() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
  ): Promise<OwnerApplicationsResponse> {
    const response = await this.applicationsService.getProjectApplications(projectId, req.user!.userId)
    return ownerApplicationsResponseSchema.parse(response)
  }

  @Patch(':id/accept')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  async accept(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.applicationsService.accept(req.user!.userId, id)
  }

  @Patch(':id/reject')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  async reject(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const input: RejectApplicationInput = rejectApplicationInputSchema.parse(body)
    return this.applicationsService.reject(req.user!.userId, id, input)
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
