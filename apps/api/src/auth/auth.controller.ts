import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '@api/auth/auth.service';
import { LocalAuthGuard } from '@api/auth/guards/local-auth.guard';
import { JwtAuthGuard } from '@api/auth/guards/jwt-auth.guard';
import { CreateUserDto } from '@shared-types';
import { RequestUserPayload } from '@api/auth/types/request-user-payload.type';
import { RequestJwtRefreshPayload } from '@api/auth/types/request-jwt-refresh-payload.type';
import { SkipAuth } from '@api/auth/decorators/skip-auth.decorator';
import { JwtRefreshGuard } from '@api/auth/guards/jwt-refresh.guard';
import { GoogleAuthGuard } from '@api/auth/guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { uuidv7 } from 'uuidv7';
import { YandexAuthGuard } from '@api/auth/guards/yandex-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      domain: 'localhost', // для localhost можно не указывать
    });
  }

  @SkipAuth()
  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    console.log({ createUserDto });
    const user = await this.authService.signup(createUserDto);
    const { accessToken, refreshToken } = await this.authService.login({
      sub: user.id,
      name: user.name,
      email: user.email,
    });

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: RequestUserPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    console.log({ user: req.user });
    const { accessToken, refreshToken } = await this.authService.login(
      req.user
    );

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  //Если не использовать JwtAuthGuard, то в request будет отсутствовать поле user.
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: RequestUserPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    console.log({ logoutUser: req.user });
    await this.authService.logout(req.user.sub);

    res.clearCookie('refresh_token');
  }

  // Отключение проверки наличия валидного accessToken, т.к. в AppModule включен глобальный APP_GUARD = JwtAuthGuard.
  @SkipAuth()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    // @Cookies('refresh_token') cookieRefreshToken: string,
    @Req() req: RequestJwtRefreshPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    // console.log({cookieRefreshToken})

    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      req.user.sub,
      req.user.refreshToken
    );

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @UseGuards(GoogleAuthGuard)
  @SkipAuth()
  @Get('google/login')
  //Авторизация через Google OAuth c стратегией GoogleStrategy
  //Перенаправляет пользователя на страницу аутентификации Google
  //В случае успешной валидации в GoogleStrategy сервером Google будет выполнен редирект на 'auth/google/callback'
  ///accessToken, refreshToken в данном случе генерируются сервером Google
  //accessToken, refreshToken и данные профиля пользователя будут переданы в 'auth/google/callback
  googleLogin() {
    // return this.authService.googleLogin();
  }

  @UseGuards(GoogleAuthGuard)
  @SkipAuth()
  @Get('google/callback')
  //На данном этапе перед доступом к этому маршруту в GoogleStrategy будет вызываться метод 'validate'
  //Получает данные от Google OAuth
  async googleCallback(
    @Req() req: RequestUserPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const { accessToken, refreshToken } = await this.authService.login(
      req.user
    );

    this.setRefreshTokenCookie(res, refreshToken);

    // Сохраняем токен во временное хранилище
    const tokenId = uuidv7();
    await this.cacheManager.set(`token:${tokenId}`, accessToken, 10000);

    const savedAccessToken = await this.cacheManager.get<string>(
      `token:${tokenId}`
    );
    console.log({ savedAccessToken });

    // Редирект на Frontend, т. к. этого требует OAutn 2.0.
    // При перенаправлении тело ответа отбрасывается,
    // передавать accessToken в query-параметрах небезопасно,
    // поэтому в query-параметрах клиенту передаётся tokenId,
    // который используется для отправки асинхронных запросов на 'api/auth/oauth-callback'
    // для получения accessToken в теле ответа.
    const frontendUrl = await this.configService.get<string>('FRONTEND_URL');
    return res.redirect(
      302,
      `${frontendUrl}/auth/oauth-success?tokenId=${tokenId}`
    );
  }

  @UseGuards(YandexAuthGuard)
  @SkipAuth()
  @Get('yandex/login')
  yandexLogin() {
    //Реализация не требуется, т.к. вся логика реализована в YandexStrategy, которую вызывает YandexAuthGuard
  }

  @UseGuards(YandexAuthGuard)
  @SkipAuth()
  @Get('yandex/callback')
  async yandexCallback(
    @Req() req: RequestUserPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedException('Yandex authentication failed');
    }

    const { accessToken, refreshToken } = await this.authService.login(
      req.user
    );

    this.setRefreshTokenCookie(res, refreshToken);

    // Сохраняем токен во временное хранилище
    const tokenId = uuidv7();
    await this.cacheManager.set(`token:${tokenId}`, accessToken, 10000);

    const savedAccessToken = await this.cacheManager.get<string>(
      `token:${tokenId}`
    );
    console.log({ savedAccessToken });

    // Редирект на Frontend, т. к. этого требует OAutn 2.0.
    // При перенаправлении тело ответа отбрасывается,
    // передавать accessToken в query-параметрах небезопасно,
    // поэтому в query-параметрах клиенту передаётся tokenId,
    // который используется для отправки асинхронных запросов на 'api/auth/oauth-callback'
    // для получения accessToken в теле ответа.
    const frontendUrl = await this.configService.get<string>('FRONTEND_URL');
    return res.redirect(
      302,
      `${frontendUrl}/auth/oauth-success?tokenId=${tokenId}`
    );
  }

  // По tokenId извлекает accessToken из кэш NestJS и отправляет егв теле ответа,
  // как требует бизнес-логика Frontend.
  @SkipAuth()
  @Get('oauth-callback')
  async handleOAuthCallback(
    @Query('tokenId') tokenId: string,
    @Res() res: Response
  ) {
    console.log({ tokenId });
    // Получаем accessToken из кеша
    const accessToken = await this.cacheManager.get<string>(`token:${tokenId}`);
    console.log({ oc: accessToken });

    if (!accessToken) {
      throw new BadRequestException('Token expired or invalid');
    }

    // Очистка кэш после первого успешного запроса на аутентификацию в целях безопасности:
    // для исключения возможности повторного запроса accessToken при краже tokenId.
    await this.cacheManager.del(`token:${tokenId}`);
    // Вариант 1: Отправляем JSON
    return res.json({ accessToken });

    // ИЛИ Вариант 2: Рендерим HTML с токеном
    // return res.send(`
    //   <html>
    //     <script>
    //       window.opener.postMessage({
    //         type: 'oauth-oauth-success',
    //         accessToken: '${accessToken}'
    //       }, '*');
    //       window.close();
    //     </script>
    //   </html>
    // `);
  }
}
