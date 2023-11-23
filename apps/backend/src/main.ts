/**
 * This is not a production server yet!
 * This is only a minimal manager to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app/app.module'
import fs from 'fs'
import { join } from 'path'
import cors from '@fastify/cors'
import cookie, { FastifyCookieOptions } from '@fastify/cookie'

const sslFolder = process.env.SSL_FOLDER_PATH || '.'
const httpsConfig = fs.existsSync(join(sslFolder, '.cert/cert.pem'))
  ? {
    key: fs.readFileSync(join(sslFolder, '.cert/key.pem')),
    cert: fs.readFileSync(join(sslFolder, '.cert/cert.pem')),
  }
  : undefined

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      https: httpsConfig as any,
      prefix: '/api',
    }),
  )

  app.setGlobalPrefix('api')

  const instance = app.getHttpAdapter().getInstance()

  instance.register(cors as any, {
    origin: (origin, cb) => {
      cb(null, true) // Always allow, similar to the given example
    },
    credentials: true,
  })

  instance.register(cookie as any, {
    secret: 'my-secret', // for cookies signature
    parseOptions: {},     // options for parsing cookies
  } as FastifyCookieOptions)

  const port = process.env.BACKEND_PORT || 3001
  await app.listen(port, '0.0.0.0')
  const protocol = httpsConfig ? 'https' : 'http'
  Logger.log(`manager is listening on: ${protocol}://127.0.0.1:${port}/`)
}

// ci cd
bootstrap()
