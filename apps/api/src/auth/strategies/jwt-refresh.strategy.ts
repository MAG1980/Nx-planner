import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { JwtRefreshPayload } from '@api/auth/types/jwt-refresh-payload.type';
import { UserPayload } from '@api/auth/types/user-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  private readonly logger = new Logger(JwtRefreshStrategy.name);
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const token = req.cookies?.refresh_token;
        this.logger.debug(
          `Extracted refresh token: ${token ? token : 'missing'}`
        );
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_JWT_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: UserPayload): JwtRefreshPayload {
    this.logger.debug(`Validating refresh token for user ID: ${payload.sub}`);
    this.logger.verbose(`Full payload: ${JSON.stringify(payload)}`);
    console.log({ payload });

    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      this.logger.warn('No refresh token found in cookies');
      throw new UnauthorizedException('No refresh token found in cookies');
    }
    return { ...payload, refreshToken };
  }
}
