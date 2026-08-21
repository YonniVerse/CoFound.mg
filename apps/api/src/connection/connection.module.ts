import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ConnectionRequestController } from './connection-request.controller.js'
import { ConnectionRequestService } from './connection-request.service.js'
import { ConnectionController } from './connection.controller.js'
import { ConnectionService } from './connection.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [ConnectionRequestController, ConnectionController],
  providers: [ConnectionRequestService, ConnectionService],
  exports: [ConnectionRequestService, ConnectionService],
})
export class ConnectionModule {}
