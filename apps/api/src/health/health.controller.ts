import { Controller, Get } from '@nestjs/common'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'

@AllowAnonymous()
@Controller('health')
export class HealthController {
  @Get()
  getHealth(): { status: 'ok' } {
    return { status: 'ok' }
  }
}
