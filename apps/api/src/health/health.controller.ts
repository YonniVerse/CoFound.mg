import { Controller, Get, Res } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { AllowAnonymous } from '../rbac/rbac.decorators.js'

type HealthResponse =
  | { status: 'ok'; database: 'ok' }
  | { status: 'degraded'; database: 'unavailable' }

type StatusResponse = {
  status: (code: number) => void
}

@AllowAnonymous()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth(@Res({ passthrough: true }) response: StatusResponse): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'ok', database: 'ok' }
    } catch {
      response.status(503)
      return { status: 'degraded', database: 'unavailable' }
    }
  }
}
