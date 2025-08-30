import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import appleOauthConfig from '@api/auth/configs/apple-oauth.config';
import { AuthService } from '@api/auth/auth.service';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    @Inject(appleOauthConfig.KEY)
    private readonly appleConfig: ConfigType<typeof appleOauthConfig>,
    private readonly authService: AuthService
  ) {
    super({
      clientID: appleConfig.clientID,
      teamID: appleConfig.teamID,
      keyID: appleConfig.keyID,
      callbackURL: appleConfig.callbackURL,
      // keyFilePath: configService.get<string>('APPLE_KEY_PATH'),
      //Данные, которые будут переданы из Apple в callback функцию
      scope: ['name', 'email'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: any,
    done: (error: any, user?: any) => void
  ) {
    try {
      // Декодируем JWT для получения информации о пользователе
      const decoded = jwt.decode(idToken) as any;

      const firstName = profile?.name?.firstName ?? '';
      const lastName = profile?.name?.lastName ?? '';

      const authAppleUser = {
        id: decoded.sub,
        email: decoded.email,
        name: `${firstName} ${lastName}`,
      };

      // Сохраняем или обновляем пользователя в базе данных
      const { id, name, email } = await this.authService.validateOauthUser({
        email: authAppleUser.email,
        name: authAppleUser.name,
        password: '',
      });

      const user = { sub: id, name, email };

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
