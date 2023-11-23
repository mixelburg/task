/* istanbul ignore file */
import {Inject, Injectable} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
      secretOrKey: config.get('JWT_KEY'),
      ignoreExpiration: false,
    })
    this.config = config
  }

  private static extractJWT(req: any): string | null {
    if (req.cookies && process.env.JWT_NAME as string in req.cookies) {
      return req.cookies[process.env.JWT_NAME as string]
    } else if (req.headers && 'authorization' in req.headers) {
      // get token from bearer format
      return req.headers.authorization.split(' ')[1]
    }

    return null
  }

  validate(payload: any) {
    return { id: payload.sub, email: payload.email }
  }
}
