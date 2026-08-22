import { Controller, Get } from '@nestjs/common'
import { productHealthSchema } from '@cofound/shared'
import { Permission } from '../rbac/permissions.js'
import { RequirePermissions } from '../rbac/rbac.decorators.js'
import { ProductHealthService } from './product-health.service.js'

@Controller('staff/health')
@RequirePermissions(Permission.PRODUCT_HEALTH_READ)
export class ProductHealthController {
  constructor(private readonly service: ProductHealthService) {}

  @Get()
  async get() {
    return productHealthSchema.parse(await this.service.get())
  }
}
