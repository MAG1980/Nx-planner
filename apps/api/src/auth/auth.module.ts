import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@api/users/users.module';
import { AuthController } from '@api/auth/auth.controller';
import { AuthService } from '@api/auth/auth.service';
import { LocalStrategy } from '@api/auth/strategies/local.strategy';
import { JwtStrategy } from '@api/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@api/auth/strategies/jwt-refresh.strategy';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '@api/auth/configs/jwt.config';
import refreshJwtConfig from '@api/auth/configs/refresh-jwt.config';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    //.asProvider() преобразует конфигурацию с пространством имен в поставщика.
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
