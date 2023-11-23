import {Body, Controller, Get, Inject, Post, Res, UseGuards} from '@nestjs/common'
import { AuthService } from './auth.service'
import { ILoginData, UserDetails, UserWithoutPassword } from '@tasks/types'
import { FastifyReply } from 'fastify'
import { JwtAuthGuard } from '../guards/auth.guard'
import { UserDec } from '../decorators/user.decorator'
import { User } from '@tasks/prisma/backend'
import { ConfigService } from '@nestjs/config'
import {RegisterDto} from "./register.dto";


@Controller('/auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(ConfigService) private config: ConfigService,
  ) {
  }

  @Post('login')
  async login(
    @Body() credentials: ILoginData,
    @Res() res: FastifyReply,
  ) {
    const token = await this.authService.login(credentials)

    res.cookie(this.config.get('JWT_NAME') as string, token, { sameSite: 'none', secure: true })

    res.send({ success: true })
  }

  @Post('register')
  async signup(@Body() credentials: RegisterDto): Promise<User | never> {
    return await this.authService.register(credentials)
  }

  @Post('logout')
  async logout(@Res() res: FastifyReply) {
    res.cookie(this.config.get('JWT_NAME') as string, '', {
      expires: new Date(0),
      sameSite: 'none',
      secure: true,
    })

    res.send({ success: true })
  }

  @UseGuards(JwtAuthGuard)
  @Get('details')
  async getUserDetails(@UserDec() user: User): Promise<UserDetails> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...other } = user
    return {
      data: other as UserWithoutPassword,
    }
  }
}
