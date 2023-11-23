/**
 * This is not a production server yet!
 * This is only a minimal manager to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )
  const port = process.env.PORT || 3000
  await app.listen(port, '0.0.0.0')
  Logger.log(`manager is listening on: http://127.0.0.1:${port}/`)
}


bootstrap()
