import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ProjectController } from './project.controller.js'
import { ProjectService } from './project.service.js'
import { BmcController } from './bmc.controller.js'
import { BmcService } from './bmc.service.js'
import { PositionController } from './position.controller.js'
import { PositionService } from './position.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController, BmcController, PositionController],
  providers: [ProjectService, BmcService, PositionService],
})
export class ProjectModule {}
