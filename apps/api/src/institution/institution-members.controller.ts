import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common'
import { institutionMemberInviteSchema, institutionMemberUpdateSchema } from '@cofound/shared'
import { AuditAction } from '../audit/audit.decorator.js'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { InstitutionMembersService } from './institution-members.service.js'

@Controller('organizations/:organizationId/members')
export class InstitutionMembersController {
  constructor(private readonly membersService: InstitutionMembersService) {}

  @Get()
  @RequirePermissions(Permission.ORG_READ)
  list(@Param('organizationId') organizationId: string, @Req() request: AuthenticatedRequest) {
    return this.membersService.list(organizationId, request.user!.userId)
  }

  @Post()
  @RequirePermissions(Permission.ORG_MANAGE)
  @AuditAction('ORGANIZATION_MEMBER_INVITE', 'OrganizationMember')
  invite(@Param('organizationId') organizationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.membersService.invite(organizationId, request.user!.userId, institutionMemberInviteSchema.parse(body))
  }

  @Patch(':id')
  @RequirePermissions(Permission.ORG_MANAGE)
  @AuditAction('ORGANIZATION_MEMBER_ROLE_UPDATE', 'OrganizationMember')
  update(@Param('organizationId') organizationId: string, @Param('id') id: string, @Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.membersService.update(organizationId, id, request.user!.userId, institutionMemberUpdateSchema.parse(body))
  }

  @Delete(':id')
  @RequirePermissions(Permission.ORG_MANAGE)
  @AuditAction('ORGANIZATION_MEMBER_REMOVE', 'OrganizationMember')
  remove(@Param('organizationId') organizationId: string, @Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.membersService.remove(organizationId, id, request.user!.userId)
  }
}
