import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { objectIdRegex } from '@tasks/client'


export const MongoId = createParamDecorator(
  async (data: unknown, context: ExecutionContext): Promise<string> => {
    const req = context.switchToHttp().getRequest()
    // get session from params

    const id = req.params.id

    if (!objectIdRegex.test(id)) {
      throw new BadRequestException(`id '${id}' is not a valid mongo id, should match ${objectIdRegex}`)
    }
    return id
  },
)
