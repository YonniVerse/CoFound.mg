import 'reflect-metadata'
import './instrument.js'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { nestLogger } from './observability/logger.js'
import { runAutoSeed } from './account-seed/auto-seed.js'
import { PrismaService } from './prisma/prisma.service.js'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(nestLogger)
  await runAutoSeed(app.get(PrismaService))
  const allowedOrigins = (process.env.CORS_ORIGIN ?? '').split(',').map((origin) => origin.trim()).filter(Boolean)
  app.enableCors({ origin: allowedOrigins.length === 0 ? true : allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins, credentials: true })
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(Number.parseInt(process.env.PORT ?? '3000', 10), '0.0.0.0')
}

void bootstrap()
