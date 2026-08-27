import { Controller, Get } from '@nestjs/common'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { ReferenceDataService } from './reference-data.service.js'

@Controller('reference-data')
@AllowAnonymous()
export class PublicReferenceDataController {
  constructor(private readonly service: ReferenceDataService) {}

  @Get('fields')
  listFields() {
    return this.service.listPublicFields()
  }
}
