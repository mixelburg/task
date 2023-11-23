/* istanbul ignore file */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import * as winston from 'winston'


export interface AppError {
  statusCode?: number
  error?: string
  message: string
  path?: string
  timestamp?: string
}


export const createFastifyHttpExceptionFilter = (logger: winston.Logger) => {
  @Catch(HttpException)
  class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp()
      const response = ctx.getResponse<FastifyReply>()
      const request = ctx.getRequest<FastifyRequest>()
      const statusCode = exception.getStatus()

      const { message, error } = exception.getResponse() as {
        message: string
        error: string
      }

      const res: AppError = {
        statusCode,
        error,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      }

      logger.debug(`[${request.method}] ${statusCode} ${request.url} -> ${message}`)

      response.code(statusCode).send(res)
    }
  }

  return HttpExceptionFilter
}
