import { Injectable } from '@nestjs/common';
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
  constructor() {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.refresh_token,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: UserPayload): JwtRefreshPayload {
    const refreshToken = req.cookies?.refresh_token;
    return { ...payload, refreshToken };
  }
}
