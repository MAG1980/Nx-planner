import { Module } from '@nestjs/common';
import { AppController } from '@api/app/app.controller';
import { AppService } from '@api/app/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from '@api/config/typeorm.config';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
