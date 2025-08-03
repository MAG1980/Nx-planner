import { Module } from '@nestjs/common';
import { AppController } from '@api/app/app.controller';
import { AppService } from '@api/app/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { getTypeOrmConfig } from '@api/config/typeorm.config';
import { UsersModule } from '@api/users/users.module';
import { AuthModule } from '@api/auth/auth.module';
import { JwtAuthGuard } from '@api/auth/guards/jwt-auth.guard';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env', // путь к файлу .env
      isGlobal: true, // делает ConfigService глобальным
      ignoreEnvFile: false, // игнорировать .env файл
      // load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' }, // access token срок жизни
    }),
    CacheModule.register({
      isGlobal: true,
      // Для in-memory кэша (по умолчанию)
      ttl: 5, // Время жизни кэша в секундах
      max: 10, // Максимальное количество элементов в кэше

      /*   // Для Redis (опционально)
         store: redisStore,
         host: 'localhost',
         port: 6379,
         ttl: 60, // 1 минута*/
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
