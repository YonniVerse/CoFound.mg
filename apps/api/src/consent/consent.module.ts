import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ConsentController } from './consent.controller.js'
import { ConsentService } from './consent.service.js'

@Module({ imports: [PrismaModule], controllers: [ConsentController], providers: [ConsentService] })
export class ConsentModule {}
