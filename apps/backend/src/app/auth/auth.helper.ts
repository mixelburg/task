import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { ConfigService } from '@nestjs/config'
import { User } from '@tasks/prisma/backend'

@Injectable()
export class AuthHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
  }

  /* istanbul ignore next */
  async decode(token: string): Promise<unknown> {
    return this.jwtService.decode(token)
  }

  generateToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: this.config.get('JWT_EXPIRES_IN') || '1d' },
    )
  }

  isPasswordValid(password: string, userPassword: string): boolean {
    return bcrypt.compareSync(password, userPassword)
  }

  encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(10)

    return bcrypt.hashSync(password, salt)
  }
}
