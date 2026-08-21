import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ProjectController } from './project.controller.js'
import { ProjectService } from './project.service.js'
import { BmcController } from './bmc.controller.js'
import { BmcService } from './bmc.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController, BmcController],
  providers: [ProjectService, BmcService],
})
export class ProjectModule {}
