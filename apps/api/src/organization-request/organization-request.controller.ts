import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { AuditAction } from '../audit/audit.decorator.js'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { OrganizationRequestService } from './organization-request.service.js'

@AllowAnonymous()
@Controller('organization-requests')
export class OrganizationRequestController {
  constructor(private readonly organizationRequestService: OrganizationRequestService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('documents', 5, { limits: { fileSize: 10_000_000 } }))
  @AuditAction('ORGANIZATION_REQUEST_CREATE', 'OrganizationRequest')
  create(@Body() body: unknown, @UploadedFiles() files: Express.Multer.File[] = []) {
    return this.organizationRequestService.create(body, files)
  }
}
