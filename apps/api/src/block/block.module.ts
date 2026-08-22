import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { BlockController } from './block.controller.js'
import { BlockService } from './block.service.js'

@Module({ imports: [PrismaModule], controllers: [BlockController], providers: [BlockService], exports: [BlockService] })
export class BlockModule {}
