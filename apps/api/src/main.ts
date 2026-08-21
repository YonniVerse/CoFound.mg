import 'reflect-metadata'
import './instrument.js'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { nestLogger } from './observability/logger.js'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(nestLogger)
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(Number.parseInt(process.env.PORT ?? '3000', 10), '0.0.0.0')
}

void bootstrap()
