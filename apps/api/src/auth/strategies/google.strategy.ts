import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../configs/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private readonly googleConfig: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService
  ) {
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackUrl,
      //Данные, которые будут переданы из Google в callback функцию
      scope: ['email', 'profile'],
      // passReqToCallback: true,
    });
  }

  //accessToken, refreshToken и profile, которые получены из Google API
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    //from 'passport-google-oauth20'
    done: VerifyCallback
  ) {
    //Если пользователь использует Google OAuth впервые, то получаем его данные из Google API и создаем нового пользователя
    //Если пользователь уже зарегистрирован в нашей БД с помощью Google OAuth, то возвращаем его
    const { id, name, email } = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      name: profile.displayName,
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
