import { Body, Controller, Get, Param, Patch, Post, Inject } from '@nestjs/common'
import { referenceCreateSchema, referenceKindSchema, referencePatchSchema } from '@cofound/shared'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ReferenceDataService } from './reference-data.service.js'

@Controller('staff/reference-data')
@RequirePermissions(Permission.REFERENCE_DATA_MANAGE)
export class ReferenceDataController {
  constructor(@Inject(ReferenceDataService) private readonly service: ReferenceDataService) {}

  @Get(':kind')
  list(@Param('kind') kind: string) {
    return this.service.list(referenceKindSchema.parse(kind))
  }

  @Post(':kind')
  create(@Param('kind') kind: string, @Body() body: unknown) {
    return this.service.create(referenceKindSchema.parse(kind), referenceCreateSchema.parse(body))
  }

  @Patch(':kind/:id')
  update(@Param('kind') kind: string, @Param('id') id: string, @Body() body: unknown) {
    return this.service.update(referenceKindSchema.parse(kind), id, referencePatchSchema.parse(body))
  }
}
