/* istanbul ignore file */
import { ArgumentMetadata, createParamDecorator, ExecutionContext, Injectable, PipeTransform } from '@nestjs/common'
import { backendPrismaClient } from '../prisma'
import { User } from '@tasks/prisma/backend'

@Injectable()
export class ParseUserPipe implements PipeTransform {
  constructor() {
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    return backendPrismaClient.user.findUnique({
      where: { id: value },
    })
  }
}

const GetUser = createParamDecorator(
  async (data: unknown, context: ExecutionContext): Promise<User | null> => {
    const req = context.switchToHttp().getRequest()

    return req.user.id
  },
)

export const UserDec = (additionalOptions?: any) =>
  GetUser(additionalOptions, ParseUserPipe)

export const UserIdDec = createParamDecorator(
  (data: unknown, context: ExecutionContext): string | null => {
    const req = context.switchToHttp().getRequest()

    return req.user.id
  },
)
