import { BadRequestException, Body, Controller, Get, Param, Post, Req, Inject } from '@nestjs/common'
import { conversationMessageCreateSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { MessagingService } from './messaging.service.js'

@Controller('conversations')
export class MessagingController {
  constructor(@Inject(MessagingService) private readonly service: MessagingService) {}
  @Post('from-connection/:connectionId')
  @RequirePermissions(Permission.MESSAGE_SEND)
  open(@Req() req: AuthenticatedRequest, @Param('connectionId') id: string) { return this.service.openDirect(req.user!.userId, id) }
  @Post('project/:projectId')
  @RequirePermissions(Permission.MESSAGE_SEND)
  openProject(@Req() req: AuthenticatedRequest, @Param('projectId') projectId: string) { return this.service.openProject(req.user!.userId, projectId) }
  @Get()
  @RequirePermissions(Permission.MESSAGE_SEND)
  list(@Req() req: AuthenticatedRequest) { return this.service.list(req.user!.userId) }
  @Get(':id/messages')
  @RequirePermissions(Permission.MESSAGE_SEND)
  messages(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.service.messages(req.user!.userId, id) }
  @Post(':id/messages')
  @RequirePermissions(Permission.MESSAGE_SEND)
  send(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    const parsed = conversationMessageCreateSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException({ code: 'VALIDATION_ERROR', messageKey: 'errors.validation' })
    return this.service.send(req.user!.userId, id, parsed.data)
  }
}
