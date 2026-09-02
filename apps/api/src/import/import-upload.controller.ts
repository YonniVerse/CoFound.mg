import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors, Inject } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AuditAction } from '../audit/audit.decorator.js'
import type { AuthenticatedRequest } from '../auth/auth-request.js'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import type { ImportField } from './import-parser.js'
import { ImportUploadService } from './import-upload.service.js'

@Controller('institution/imports')
@RequirePermissions(Permission.ORG_READ)
export class ImportUploadController {
  constructor(@Inject(ImportUploadService) private readonly importUploadService: ImportUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10_000_000 } }))
  @AuditAction('IMPORT_UPLOAD', 'ImportBatch')
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('organizationId') organizationId: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.importUploadService.upload(file, request.user!.userId, organizationId)
  }

  @Get(':id/mapping')
  async mapping(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.importUploadService.getMapping(id, request.user!.userId)
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.importUploadService.getPreview(id, request.user!.userId)
  }

  @Patch(':id')
  @AuditAction('IMPORT_UPDATE_MAPPING', 'ImportBatch')
  async updateMapping(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: AuthenticatedRequest) {
    const columns = body && typeof body === 'object' && 'columns' in body && body.columns ? (body.columns as Record<string, ImportField | null>) : (body as Record<string, ImportField | null>)
    return this.importUploadService.updateMapping(id, request.user!.userId, columns)
  }
}
