// src/auth/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@api/auth/decorators/skip-auth.decorator';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from '@api/auth/types/user-payload.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Проверяем, есть ли метаданные @SkipAuth()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Проверяем наличие декоратора @SkipAuth() у метода (например, GET /login)
      context.getClass(), // Проверяем наличие декоратора у контроллера (если @SkipAuth() на классе)
    ]);

    // Если маршрут публичный, пропускаем аутентификацию
    if (isPublic) {
      return true;
    }

    // Иначе проверяем JWT
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Токен не предоставлен');
    }

    try {
      // Извлечение данных пользователя из accessToken.
      const payload = await this.validateToken(token);

      // Добавляем UserPayload в запрос для использования в контроллерах.
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Неверный или истекший токен: ', error);
    }
  }

  private extractTokenFromHeader(
    request: Request & { headers: { authorization: string } }
  ): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async validateToken(token: string): Promise<UserPayload> {
    return await this.jwtService.verifyAsync(token);
  }
}
