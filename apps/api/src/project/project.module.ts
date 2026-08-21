import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ProjectController } from './project.controller.js'
import { ProjectService } from './project.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
