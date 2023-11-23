/* eslint-disable no-constant-condition */
import { All, Body, Controller, Get, Req, Res } from '@nestjs/common'

import { AppService } from './app.service'
import { HealthCheckResponse } from '@tasks/types'
import { APP_VERSION } from '@tasks/config'
import { FastifyReply, FastifyRequest } from 'fastify'
import { ConfigService } from '@nestjs/config'
import { joinUrl } from '@tasks/util'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly config: ConfigService) {}

  @Get('health')
  async health(): Promise<HealthCheckResponse> {
    return {
      version: APP_VERSION,
      database: { ok: true },
    }
  }

  @All('manager/*')
  async manager(@Req() req: FastifyRequest, @Res() res: FastifyReply, @Body() body: any) {
    const proxyUrl = req.url.split('manager/').at(-1)

    const TASK_MANAGER_URL = this.config.get('TASKS_MANAGER_URL') || 'http://127.0.0.1:3000/'

    const params = ['GET', 'HEAD'].includes(req.method)
      ? {}
      : {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body || {}),
        }

    const result = await fetch(joinUrl(TASK_MANAGER_URL, proxyUrl), {
      method: req.method,
      ...params,
    })
    const chunks: Uint8Array[] = []
    const reader = result.body?.getReader()

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    }

    const data = Buffer.concat(chunks).toString('utf-8')
    const jsonData = JSON.parse(data)

    res.code(result.status)
    res.send(jsonData)
  }
}
