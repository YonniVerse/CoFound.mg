import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common'
import { addProjectMemberSchema, updateProjectMemberRoleSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProjectMembersService } from './project-members.service.js'

@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(private readonly membersService: ProjectMembersService) {}

  @Get()
  @RequirePermissions(Permission.PROJECT_READ)
  list(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.membersService.list(projectId, request.user!.userId)
  }

  @Post()
  @RequirePermissions(Permission.PROJECT_MANAGE)
  add(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() body: unknown) {
    const input = addProjectMemberSchema.parse(body)
    return this.membersService.add(projectId, request.user!.userId, input.userId, input.role)
  }

  @Patch(':memberId/role')
  @RequirePermissions(Permission.PROJECT_MANAGE)
  updateRole(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string, @Param('memberId') memberId: string, @Body() body: unknown) {
    const input = updateProjectMemberRoleSchema.parse(body)
    return this.membersService.updateRole(projectId, request.user!.userId, memberId, input.role)
  }

  @Delete('me')
  @RequirePermissions(Permission.PROJECT_READ)
  leave(@Req() request: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.membersService.leave(projectId, request.user!.userId)
  }
}
