import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-yandex';
import yandexOauthConfig from '../configs/yandex-oauth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UserPayload } from '@api/auth/types/user-payload.type';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(
    @Inject(yandexOauthConfig.KEY)
    private readonly yandexConfig: ConfigType<typeof yandexOauthConfig>,
    private readonly authService: AuthService
  ) {
    super({
      clientID: yandexConfig.clientId,
      clientSecret: yandexConfig.clientSecret,
      callbackURL: yandexConfig.callbackUrl,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: string | null, user: UserPayload) => void
  ) {
    const { id, name, email } = await this.authService.validateYandexUser({
      email: profile.emails[0].value,
      name: `${profile.name.givenName} ${profile.name.familyName}`,
      password: '',
    });

    // Данные, указанные в user будут добавлены в request.user,
    // поэтому нужно быть абсолютно уверенным, что user не содержит password.
    const user = { sub: id, name, email };

    //Данные пользователя будут добавлены в request.user,
    // поэтому нужно быть абсолютно уверенным, что user не содержит password.
    done(null, user);
  }
}
