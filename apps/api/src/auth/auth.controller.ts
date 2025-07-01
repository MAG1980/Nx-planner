import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      domain: 'localhost', // для localhost можно не указывать
    });
  }
}
