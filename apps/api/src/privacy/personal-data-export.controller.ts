import { Body, Controller, Get, Inject, Param, Post, Req, Res } from '@nestjs/common'
type DownloadResponse = { setHeader(name: string, value: string): void; send(body: Buffer): unknown }
import { personalDataExportRequestSchema } from '@cofound/shared'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { PersonalDataExportService } from './personal-data-export.service.js'

@Controller('me/privacy/exports')
@RequirePermissions(Permission.TALENT_READ)
export class PersonalDataExportController {
  constructor(@Inject(PersonalDataExportService) private readonly service: PersonalDataExportService) {}

  @Post()
  request(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.service.request(request.user!.userId, personalDataExportRequestSchema.parse(body))
  }

  @Get(':id/download')
  async download(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Res() response: DownloadResponse) {
    const result = await this.service.download(request.user!.userId, id)
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
    return response.send(result.body)
  }

  @Get(':id')
  status(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.status(request.user!.userId, id)
  }
}
