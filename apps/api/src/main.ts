import 'reflect-metadata'
import './instrument.js'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { nestLogger } from './observability/logger.js'
import { runAutoSeed } from './account-seed/auto-seed.js'
import { PrismaService } from './prisma/prisma.service.js'

const VERCEL_DEPLOYMENT_ORIGIN = /^https:\/\/co-found-[a-z0-9-]+-yonni-coders-projects\.vercel\.app$/i

function configureCors(app: { enableCors: (options: unknown) => void }): void {
  const configuredOrigins = new Set(
    (process.env.CORS_ORIGIN ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )

  app.enableCors({
    origin: (requestOrigin: string | undefined, callback: (error: Error | null, allowed?: boolean) => void) => {
      const isAllowed = !requestOrigin || configuredOrigins.has(requestOrigin) || VERCEL_DEPLOYMENT_ORIGIN.test(requestOrigin)
      callback(isAllowed ? null : new Error('Origine CORS non autorisée.'), isAllowed)
    },
    credentials: true,
  })
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(nestLogger)
  await runAutoSeed(app.get(PrismaService))
  configureCors(app)
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(Number.parseInt(process.env.PORT ?? '3000', 10), '0.0.0.0')
}

void bootstrap()
