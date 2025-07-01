/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@api/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  // Глобальная настройка ValidationPipe.
  // Также возможно внедрение индивидуального ValidationPipe в каждый модуль (кастомный провайдер)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет поля, не описанные в DTO
      forbidNonWhitelisted: true, // Бросает ошибку, если есть лишние поля
      transform: true, // Преобразует данные в соответствии с типами DTO
      disableErrorMessages: false, // Отключает сообщения об ошибках (false - показывать)
      transformOptions: {
        enableImplicitConversion: true, // Включает неявное преобразование типов
      },
    })
  );
  // Конфигурация Swagger
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Настройка CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Разрешить только фронтенд на 3000 порту
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Если используются куки/авторизация
    allowedHeaders: 'Content-Type, Authorization',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
