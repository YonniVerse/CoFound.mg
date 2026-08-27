import { Controller, Get, Inject } from '@nestjs/common'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'
import { ReferenceDataService } from './reference-data.service.js'

@Controller('reference-data')
@AllowAnonymous()
export class PublicReferenceDataController {
  constructor(@Inject(ReferenceDataService) private readonly service: ReferenceDataService) {}

  @Get('fields')
  listFields() {
    return this.service.listPublicFields()
  }

  @Get('skills')
  listSkills() {
    return this.service.listPublicSkills()
  }

  @Get('sectors')
  listSectors() {
    return this.service.listPublicSectors()
  }
}
