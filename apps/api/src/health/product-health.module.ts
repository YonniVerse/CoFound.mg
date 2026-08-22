import { Module } from '@nestjs/common'
import { ProductHealthController } from './product-health.controller.js'
import { ProductHealthService } from './product-health.service.js'

@Module({
  controllers: [ProductHealthController],
  providers: [ProductHealthService],
})
export class ProductHealthModule {}
