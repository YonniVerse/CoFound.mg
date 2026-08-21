import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req } from '@nestjs/common'
import { addProjectMemberSchema, updateProjectMemberRoleSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProjectMembersService } from './project-members.service.js'

function parseBody<T>(schema: { safeParse: (body: unknown) => { success: true; data: T } | { success: false } }, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', messageKey: 'errors.validation' })
  return result.data
}

@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(@Inject(ProjectMembersService) private readonly membersService: ProjectMembersService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  list(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.membersService.list(projectId, request.user!.userId)
  }

  @Post()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  add(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    const input = parseBody(addProjectMemberSchema, body)
    return this.membersService.add(projectId, request.user!.userId, input.userId, input.role)
  }

  @Patch(':memberId/role')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  updateRole(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Param('memberId') memberId: string, @Body() body: unknown) {
    const input = parseBody(updateProjectMemberRoleSchema, body)
    return this.membersService.updateRole(projectId, request.user!.userId, memberId, input.role)
  }

  @Delete('me')
  @RequirePermissions(Permission.PROJECT_READ)
  leave(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.membersService.leave(projectId, request.user!.userId)
  }
}
