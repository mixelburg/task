import {Inject, Injectable, UnauthorizedException} from '@nestjs/common'
import { AuthHelper } from './auth.helper'
import { ILoginData } from '@tasks/types'
import { User } from '@tasks/prisma/backend'
import { backendPrismaClient } from '../prisma'
import { RegisterDto } from './register.dto'
import { ConfigService } from '@nestjs/config'
import logger from '../logger'

@Injectable()
export class AuthService {
  constructor(
    @Inject(AuthHelper) private authHelper: AuthHelper,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {
    const run = async () => {
      if (!config.get('ADMIN_PASSWORD')) return
      await backendPrismaClient.user.upsert({
        where: { email: 'admin@root.com' },
        create: {
          email: 'admin@root.com',
          password: authHelper.encodePassword(config.get('ADMIN_PASSWORD') as string),
          name: 'admin',
        },
        update: {},
      })
    }
    run().catch(console.error).then(() => {
      logger.debug('admin user ensured')
    })
  }

  async login(credentials: ILoginData): Promise<string> {
    const { email, password } = credentials
    const user = await backendPrismaClient.user.findUnique({ where: { email } })

    if (!user) {
      throw new UnauthorizedException('User does not exist')
    }

    const isPasswordValid: boolean = this.authHelper.isPasswordValid(
      password,
      user.password,
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.authHelper.generateToken(user)
  }

  async register(credentials: RegisterDto): Promise<User | never> {
    const { name, email, password }: RegisterDto = credentials
    const userExist = await backendPrismaClient.user.findUnique({
      where: { email },
    })

    if (userExist) throw new UnauthorizedException('user already exists')

    return backendPrismaClient.user.create({
      data: {
        email,
        name,
        password: this.authHelper.encodePassword(password),
      },
    })
  }
}
